import os
import re
from datetime import datetime

import requests
from bs4 import BeautifulSoup


class Main:
    def main(self):
        current_dir = os.path.dirname(os.path.abspath(__file__))
        store_dir = current_dir + "/store"
        today_dir = store_dir + "/" + datetime.now().strftime("%Y-%m-%d")
        html_dir = today_dir + "/html"

        f_hub = "https://freelance-hub.jp"

        network_engineer = {"url": f_hub + "/project/job/3/", "file": "network_engineer.html"}
        ai_engineer = {"url": f_hub + "/project/job/44/", "file": "ai_engineer.html"}
        pmo = {"url": f_hub + "/project/job/50/", "file": "pmo.html"}
        java = {"url": f_hub + "/project/skill/3/", "file": "java.html"}
        javascript = {"url": f_hub + "/project/skill/4/", "file": "javascript.html"}
        python = {"url": f_hub + "/project/skill/7/", "file": "python.html"}

        lists = [network_engineer, ai_engineer, pmo, java, javascript, python]

        if not os.path.exists(store_dir):
            os.makedirs(store_dir)

        if not os.path.exists(today_dir):
            os.makedirs(today_dir)

        if not os.path.exists(html_dir):
            os.makedirs(html_dir)

        for content in lists:
            self.__download_html(content, html_dir)
            project_ids = self.__get_project_ids(os.path.join(html_dir, content["file"]))
            self.__set_project_list(project_ids, today_dir + "/project_ids_" + content["file"].replace(".html", ".txt"))

    def __download_html(self, content, path):
        try:
            # URLからHTMLを取得
            response = requests.get(content["url"])

            # ステータスコードが200 OKであれば、HTMLを表示
            if response.status_code == 200:
                with open(
                    os.path.join(path, content["file"]),
                    "wb",
                ) as file:
                    file.write(response.content)
            else:
                print(f"{content['file']}ダウンロード時 HTTPエラーコード: {response.status_code}")
        except Exception as e:
            print(f"{content['file']}ダウンロード時にエラーが発生しました: {e}")

    def __get_project_ids(self, file_path, parser="html.parser"):
        if file_path == "":
            print(f"{file_path} はファイル名が空です。")
            return
        with open(file_path, "r") as f:
            html = f.read()
        soup = BeautifulSoup(html, parser)

        if soup is None:
            print(f"{file_path} はHTMLが空です。")
            return

        id_pattern = re.compile("^ProjectListPc_ProjectCard_")
        project_cards = soup.find_all(class_="ProjectCard", id=id_pattern)

        project_ids = []
        for c in project_cards:
            project_id = c.get("id").replace("ProjectListPc_ProjectCard_", "")
            project_ids.append(project_id)

        return project_ids

    def __set_project_list(self, project_ids, file_path):
        if file_path == "":
            print(f"{file_path} はファイル名が空です。")
            return

        with open(file_path, "w") as f:
            for id in project_ids:
                f.write(id + "\n")


if __name__ == "__main__":
    Main().main()
