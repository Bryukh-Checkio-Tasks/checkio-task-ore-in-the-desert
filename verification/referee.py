from random import randint
from checkio.signals import ON_CONNECT
from checkio import api
from checkio.referees.multicall import CheckiORefereeMulti

from tests import TESTS


def initial_referee(init):
    return {
        "input": [],
        "ore_coordinate": init or [randint(0, 9), randint(0, 9)],
        "probes": 4
    }


def process_referee(referee_data, user_result):
    if type(user_result) != list or len(user_result) != 2 or type(user_result[0]) != int or type(user_result[0]) != int:
        referee_data.update({
            "result": False,
            "result_addon": "The function should return a list with three values.",
            "explanation": -1
        })
        return referee_data
    row = user_result[0]
    col = user_result[1]
    if row < 0 or row > 9 or col < 0 or col > 9:
        referee_data.update({
            "result": False,
            "result_addon": "Probes coordinates outside the desert.",
            "explanation": -1
        })
        return referee_data
    ore = referee_data["ore_coordinate"]
    if [row, col] == ore:
        referee_data.update({
            "result": True,
            "result_addon": "You found ore!",
            "explanation": 0
        })
        return referee_data
    dist = round(((user_result[0] - ore[0]) ** 2 + (user_result[1] - ore[1]) ** 2) ** 0.5)
    referee_data["probes"] -= 1
    if referee_data["probes"] == 0:
        referee_data.update({
            "result": False,
            "result_addon": "It was last probe.",
            "explanation": dist
        })
        return referee_data
    referee_data["input"].append([row, col, dist])
    referee_data.update({
        "result": True,
        "result_addon": "Next step.",
        "explanation": dist,

    })
    return referee_data


def is_win_referee(referee_data):
    return referee_data["explanation"] == 0

api.add_listener(
    ON_CONNECT,
    CheckiORefereeMulti(
        tests=TESTS,
        initial_referee=initial_referee,
        process_referee=process_referee,
        is_win_referee=is_win_referee,
    ).on_ready)
