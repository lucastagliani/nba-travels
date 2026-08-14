#!/usr/bin/env python3
"""Flatten NBA schedule JSON into one object per game."""

import argparse
import json
from pathlib import Path


def transform_team(team: dict) -> dict:
    return {
        "city": team["teamCity"],
        "name": team["teamName"],
        "tricode": team["teamTricode"],
    }


def transform_game(game: dict) -> dict:
    # homeTeamTime is local tip-off time at the venue (despite the Z suffix)
    local_dt = game["homeTeamTime"]
    date = local_dt[:10]
    time = local_dt[11:16]

    location_parts = [game["arenaCity"], game["arenaState"]]
    location = ", ".join(part for part in location_parts if part)

    entry = {
        "gameId": game["gameId"],
        "gameCode": game["gameCode"],
        "seasonType": game.get("gameLabel") or None,
        "date": date,
        "dayOfWeek": game.get("day"),
        "timeLocal": time,
        "location": location,
        "arena": {
            "name": game["arenaName"],
            "city": game["arenaCity"],
            "state": game["arenaState"],
        },
        "isNeutralSite": game.get("isNeutral", False),
        "homeTeam": transform_team(game["homeTeam"]),
        "awayTeam": transform_team(game["awayTeam"]),
    }

    sub_label = game.get("gameSubLabel") or ""
    if sub_label:
        entry["notes"] = sub_label

    return entry


def flatten_schedule(raw, limit=None):
    games = []
    for game_date in raw["leagueSchedule"]["gameDates"]:
        for game in game_date["games"]:
            games.append(transform_game(game))
            if limit is not None and len(games) >= limit:
                return games
    return games


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--input",
        type=Path,
        default=Path("data/nba-full-schedule-2026-2027-raw.json"),
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=Path("data/nba-schedule-2026-2027.json"),
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=None,
        help="Only transform the first N games (useful for sampling)",
    )
    args = parser.parse_args()

    with args.input.open() as f:
        raw = json.load(f)

    games = flatten_schedule(raw, limit=args.limit)

    output = {
        "seasonYear": raw["leagueSchedule"]["seasonYear"],
        "sourceGeneratedAt": raw["meta"]["time"],
        "gameCount": len(games),
        "games": games,
    }

    args.output.parent.mkdir(parents=True, exist_ok=True)
    with args.output.open("w") as f:
        json.dump(output, f, indent=2)
        f.write("\n")

    print(f"Wrote {len(games)} games to {args.output}")


if __name__ == "__main__":
    main()
