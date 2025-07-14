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

        # Get user's puuid
        account_url = f"https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/{game_name}/{tag_line}"
        account_res = requests.get(account_url, headers=headers)
        if account_res.status_code != 200:
            return jsonify({"error": "Account not found"}), 404

        puuid = account_res.json()["puuid"]

        # Get Match IDs
        match_url = f"https://americas.api.riotgames.com/lol/match/v5/matches/by-puuid/{puuid}/ids"
        match_id_res = requests.get(match_url, headers=headers, params={"start": 0, "count": 5})
        match_ids = match_id_res.json()

        # Get match data
        match_data = []

        for match_id in match_ids:
            detail_url = f"https://americas.api.riotgames.com/lol/match/v5/matches/{match_id}"
            detail_res = requests.get(detail_url, headers=headers)
            match = detail_res.json()
            #List to put players in their sides
            blue = []
            red = []
            total_blue = 0
            total_red = 0
            player_data = None
            queueType = ""
            if match["info"]["queueId"] == 420:
                queueType = "Ranked Solo/Duo"
            elif match["info"]["queueId"] == 440:
                queueType = "Ranked Flex 5v5"
            else:
                queueType = "Normal"

            # Find the participant data for this puuid
            for participant in match["info"]["participants"]:
                    player_info = {
                        "summonerName": participant["summonerName"],
                        "championName": participant["championName"],
                        "teamId" : participant["teamId"],
                        "kills": participant["kills"],
                        "deaths": participant["deaths"],
                        "assists": participant["assists"],
                        "win": participant["win"],
                        "gameMode": match["info"]["gameMode"],
                        "gameDuration": match["info"]["gameDuration"]
                    }
                    #Sets players into their sides
                    if participant["teamId"] == 100:
                     blue.append(player_info)
                     total_blue += participant["kills"]
                    else:
                     red.append(player_info)
                     total_red += participant["kills"]

                    if participant["puuid"] == puuid:
                     player_data = player_info

            #Grab global variables for match state
            match_summary = {
                "gameMode": match["info"]["gameMode"],
                "gameDuration": match["info"]["gameDuration"],
                "player": player_data,
                "queueType" : queueType,
                "blueTeam": blue,
                "redTeam": red,
                "killsRed": total_red,
                "killsBlue": total_blue
            }
            #Set summary to matcha_data
            match_data.append(match_summary)
                    


        return jsonify(match_data)

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route("/match-timeline", methods = "POST")
def get_match_timeline():
    try:
        data = request.get_json()
        match_id = data.get("matchId")
        url = "https://americas.api.riotgames.com/lol/match/v5/matches/{match_Id}/timeline"

    except Exception as e:
        return jsonify({"error": str(e)}), 500



