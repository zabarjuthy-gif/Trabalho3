"""Controller program to manage the benchmark.

It manages the perturbation and evaluates the performance of the user
controller.
"""

from controller import Supervisor
import os
import random
import sys

BENCHMARK_NAME = "Inverted Pendulum"


# function to convert a time in seconds to a string with format mm:ss:cs with zero padding
def timeToString(time):
    minutes = int(time / 60)
    seconds = int(time - minutes * 60)
    centiseconds = int((time - minutes * 60 - seconds) * 100)
    return f"{minutes:02d}:{seconds:02d}.{centiseconds:02d}"


# Get random generator seed value from 'controllerArgs' field
seed = 1
if len(sys.argv) > 1 and sys.argv[1].startswith('seed='):
    seed = int(sys.argv[1].split('=')[1])

robot = Supervisor()

timestep = int(robot.getBasicTimeStep())

jointParameters = robot.getFromDef("PENDULUM_PARAMETERS")
positionField = jointParameters.getField("position")

# emitter needed for the physics plugin?
emitter = robot.getDevice("emitter")
time = 0
force = 0
forceStep = 800
random.seed(seed)
running = True

while robot.step(timestep) != -1 and running:
    if running:
        time = robot.getTime()
        robot.wwiSendText(f"timeString_{timeToString(time)}")
        robot.wwiSendText(f"force:{force:.2f}")

        # Detect status of inverted pendulum
        position = positionField.getSFFloat()
        if position < -1.58 or position > 1.58:
            # stop
            running = False
            message = f'success:{BENCHMARK_NAME}:{time}_{timeToString(time)}'
            robot.wwiSendText(message)
        else:
            if forceStep <= 0:
                forceStep = 800 + random.randint(0, 400)
                force = force + 0.02
                toSend = f"{force:.2f} {seed}"
                if sys.version_info.major > 2:
                    toSend = bytes(toSend, "utf-8")
                emitter.send(toSend)
            else:
                forceStep = forceStep - 1

# Performance output used by automated CI script
CI = os.environ.get("CI")
if CI:
    print(f"performance:{time}")
else:
    print(f"{BENCHMARK_NAME} benchmark complete! Your performance was {timeToString(time)}")

robot.simulationSetMode(Supervisor.SIMULATION_MODE_PAUSE)
