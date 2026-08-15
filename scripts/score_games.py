#!/usr/bin/env python3
"""Score games using team and city tier lists."""

import argparse
import json
from pathlib import Path


def build_tier_lookup(tiers_doc, key):
    lookup = {}
    default_tier = tiers_doc.get("defaultTier", "C")
    for tier, entries in tiers_doc.get("tiers", {}).items():
        for entry in entries:
            lookup[entry[key]] = tier
    return lookup, default_tier


def tier_points(tier, points_map):
    return points_map.get(tier, points_map["C"])


def blend_team_score(home_pts, away_pts, max_weight, min_weight):
    high = max(home_pts, away_pts)
    low = min(home_pts, away_pts)
    return (max_weight * high) + (min_weight * low)


def apply_season_multiplier(game_score, season_type, config):
    multipliers = config.get("seasonTypeMultipliers", {})
    if not season_type:
        return game_score
    multiplier = multipliers.get(season_type, 1.0)
    return game_score * multiplier


def score_game(game, team_lookup, team_default, city_lookup, city_default, config):
    points_map = config["tierPoints"]
    team_cfg = config["teamScore"]
    combo = config["combination"]

    home_tier = team_lookup.get(game["homeTeam"]["tricode"], team_default)
    away_tier = team_lookup.get(game["awayTeam"]["tricode"], team_default)
    city_tier = city_lookup.get(game["arena"]["city"], city_default)

    home_pts = tier_points(home_tier, points_map)
    away_pts = tier_points(away_tier, points_map)
    city_pts = tier_points(city_tier, points_map)

    team_score = blend_team_score(
        home_pts,
        away_pts,
        team_cfg["maxWeight"],
        team_cfg["minWeight"],
    )
    game_score = (combo["teamWeight"] * team_score) + (combo["cityWeight"] * city_pts)
    game_score = apply_season_multiplier(game_score, game.get("seasonType"), config)

    result = {
        "gameScore": round(game_score, 2),
        "teamScore": round(team_score, 2),
        "cityScore": city_pts,
        "homeTeamTier": home_tier,
        "awayTeamTier": away_tier,
        "cityTier": city_tier,
    }

    season_type = game.get("seasonType")
    multipliers = config.get("seasonTypeMultipliers", {})
    if season_type and season_type in multipliers:
        result["seasonTypeMultiplier"] = multipliers[season_type]

    return result


def score_schedule(schedule, team_tiers, city_tiers, config):
    team_lookup, team_default = build_tier_lookup(team_tiers, "tricode")
    city_lookup, city_default = build_tier_lookup(city_tiers, "city")

    scored_games = []
    for game in schedule["games"]:
        scored = dict(game)
        scored["interest"] = score_game(
            game,
            team_lookup,
            team_default,
            city_lookup,
            city_default,
            config,
        )
        scored_games.append(scored)

    return {
        "seasonYear": schedule["seasonYear"],
        "sourceGeneratedAt": schedule.get("sourceGeneratedAt"),
        "scoringConfig": config,
        "gameCount": len(scored_games),
        "games": scored_games,
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--season-dir",
        type=Path,
        default=Path("data/2026-2027-season"),
        help="Season folder (schedule, team tiers, scoring config)",
    )
    parser.add_argument(
        "--trip",
        type=str,
        default="east-coast",
        help="Trip id under season/trips/ (city tiers are per trip)",
    )
    parser.add_argument(
        "--schedule",
        type=Path,
        default=None,
        help="Override schedule JSON path",
    )
    parser.add_argument(
        "--team-tiers",
        type=Path,
        default=None,
        help="Override team tiers JSON path",
    )
    parser.add_argument(
        "--city-tiers",
        type=Path,
        default=None,
        help="Override city tiers JSON path",
    )
    parser.add_argument(
        "--config",
        type=Path,
        default=None,
        help="Override scoring config path",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=None,
        help="Override output path",
    )
    args = parser.parse_args()

    season_dir = args.season_dir
    trip_dir = season_dir / "trips" / args.trip

    schedule_path = args.schedule or season_dir / "nba-schedule-2026-2027.json"
    team_tiers_path = args.team_tiers or season_dir / "team-tiers.json"
    city_tiers_path = args.city_tiers or trip_dir / "city-tiers.json"
    config_path = args.config or season_dir / "scoring-config.json"
    output_path = args.output or (
        season_dir / "nba-schedule-2026-2027-scored.json"
        if args.trip == "east-coast"
        else trip_dir / "nba-schedule-scored.json"
    )

    schedule = json.loads(schedule_path.read_text())
    team_tiers = json.loads(team_tiers_path.read_text())
    city_tiers = json.loads(city_tiers_path.read_text())
    config = json.loads(config_path.read_text())

    output = score_schedule(schedule, team_tiers, city_tiers, config)
    output["scoredForTrip"] = args.trip

    output_path.parent.mkdir(parents=True, exist_ok=True)
    with output_path.open("w") as f:
        json.dump(output, f, indent=2)
        f.write("\n")

    top = sorted(output["games"], key=lambda g: g["interest"]["gameScore"], reverse=True)[:5]
    print(f"Scored for trip '{args.trip}' using {city_tiers_path.name}")
    print(f"Wrote {output['gameCount']} scored games to {output_path}")
    print("Top 5 by gameScore:")
    for game in top:
        away = game["awayTeam"]["tricode"]
        home = game["homeTeam"]["tricode"]
        score = game["interest"]["gameScore"]
        print(f"  {score:.2f}  {away} @ {home}  ({game['location']}, {game['date']})")


if __name__ == "__main__":
    main()
