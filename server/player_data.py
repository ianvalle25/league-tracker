from flask import Flask, jsonify,request
import requests
from flask_cors import CORS


app = Flask(__name__)
CORS(app)

RIOT_API_KEY = "RGAPI-7fde02e5-9826-46fd-a1ce-e48c98bb01f4"


@app.route("/summoner/<game_name>/<tag_line>")
def get_summoner_info(game_name, tag_line):
    try:
        headers = {"X-Riot-Token": RIOT_API_KEY}
        
        url = f"https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/{game_name}/{tag_line}"
        account_res = requests.get(url, headers=headers)
        if account_res.status_code != 200:
            return jsonify({
                "error": "Riot ID not found",
                "status": account_res.status_code,
                "message": account_res.json().get("status", {}).get("message", "")
            }), account_res.status_code


        account_data = account_res.json()
        puuid = account_data["puuid"]

        url2 = f"https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/{puuid}"
        summoner_res = requests.get(url2, headers=headers)
        summoner_data = summoner_res.json()

        solo_rank = {
            "tier": "UNRANKED",
            "rank": "",
            "leaguePoints": 0
        }

        url3 = f"https://na1.api.riotgames.com/lol/league/v4/entries/by-puuid/{puuid}"
        summoner_entry_res = requests.get(url3, headers=headers)
        summoner_entry_data = summoner_entry_res.json()

        for entry in summoner_entry_data:
            if entry["queueType"] == "RANKED_SOLO_5x5":
                solo_rank = {
                    "tier": entry["tier"],
                    "rank": entry["rank"],
                    "leaguePoints": entry["leaguePoints"]
                 }

        return jsonify({
            "gameName": account_data["gameName"],
            "tagLine" : account_data["tagLine"],
            "rank" : solo_rank["rank"],
            "leaguePoints" : solo_rank["leaguePoints"],
            "tier" : solo_rank["tier"],
            "summonerLevel" : summoner_data["summonerLevel"]


            })
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

@app.route("/summoner", methods=["POST"])
def get_summoner_from_post():
      try:
        data = request.get_json()
        riot_id = data.get("riotId")

        if not riot_id or "#" not in riot_id:
            return jsonify({"error": "Invalid Riot ID format"}), 400

        game_name, tag_line = riot_id.split("#")
        return get_summoner_info(game_name=game_name, tag_line=tag_line)
      except Exception as e:
        return jsonify({"error": str(e)}), 500
      
@app.route("/match-history", methods=["POST"])
def get_match_history():
    try:
        data = request.get_json()
        riot_id = data.get("riotId")
        if not riot_id or "#" not in riot_id:
            return jsonify({"error": "Invalid Riot ID"}), 400

        game_name, tag_line = riot_id.split("#")
        headers = {"X-Riot-Token": RIOT_API_KEY}

        account_url = f"https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/{game_name}/{tag_line}"
        account_res = requests.get(account_url, headers=headers)
        puuid = account_res.json()["puuid"]

        match_url = f"https://americas.api.riotgames.com/lol/match/v5/matches/by-puuid/{puuid}/ids"
        match_id_res = requests.get(match_url, headers=headers, params={"start": 0, "count": 5})
        match_ids = match_id_res.json()

        match_data = []

        for match_id in match_ids:
            detail_url = f"https://americas.api.riotgames.com/lol/match/v5/matches/{match_id}"
            detail_res = requests.get(detail_url, headers=headers)
            match_data.append(detail_res.json())
        
        return jsonify(match_data)
        
    except:
         return jsonify({"error": str(e)}), 500