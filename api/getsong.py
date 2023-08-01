from http.server import BaseHTTPRequestHandler
from urllib import parse
import yt_dlp
import json

class handler(BaseHTTPRequestHandler):
    base_url = "https://www.youtube.com/watch?v="
    ydl_opts = {
        'format': 'bestaudio',
        'noplaylist':'True'
    }

    def do_GET(self):
        s = self.path
        dic = dict(parse.parse_qsl(parse.urlsplit(s).query))
        self.send_response(200)
        self.send_header('Content-type','application/json')
        self.end_headers()
        q = dic.get("q",None)
        data = {"error" : "Invalid Query"}
        if q:
            try:
                url = self.base_url + q
                with yt_dlp.YoutubeDL(self.ydl_opts) as ydl:
                    info = ydl.extract_info(url,download=False)
                    playurl = info.get("url")
                data = {
                    "video_id" : q,
                    'title' : info.get("title"),
                    'description' : info.get("description"),
                    "playurl" : playurl,
                    'thumbnail' : info.get("thumbnail")
                }
            except:
                data = {"error" : "Something Went Wrong"}

        data = json.dumps(data)
        self.wfile.write(data.encode(encoding='utf_8'))
        return

