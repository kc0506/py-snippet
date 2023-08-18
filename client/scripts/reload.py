import os
import time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.remote.shadowroot import ShadowRoot

# * Modify the port
# ? Command: ./chrome.exe  --remote-debugging-port=[port]  --user-data-dir="D:\selenium_data"
PORT = 9000
option = Options()
option.add_experimental_option("debuggerAddress", f"localhost:{PORT}")

# * Make sure have logged in and load the extension
driver = webdriver.Chrome(option)
driver.get("chrome://extensions")
extension_tab = driver.current_window_handle


def update():
    # driver.switch_to.window(extension_tab)
    shadow_path = [
        "extensions-manager",
        "extensions-item-list",
        "extensions-item",
        "cr-icon-button",
    ]
    cur: webdriver.Chrome | ShadowRoot = driver
    ele = None
    for item in shadow_path:
        ele = cur.find_element(By.CSS_SELECTOR, item)
        cur = ele.shadow_root
    if ele:
        ele.click()

    # cur_handles = list(driver.window_handles)
    # for handle in cur_handles:
    #     if handle != extension_tab:
    #         driver.switch_to.window(handle)
    #         driver.refresh()


# * Watch for file changes
# ? This is too complicated
# class Entry(NamedTuple):
#     path: str
#     children: list["Entry"]  # empty if path is a file

watched_files = ["manifest.json", "dist/content.js", "dist/service-worker.js"]
last_mtimes: dict[str, float] = dict()


DELTA = 0.1  # check for updates every DELTA sec
DELAY = 2  # will not update in the DELAY duration

update_flag = False
delay_duration = 0
while True:
    delay_duration = max(0, delay_duration - DELTA)
    # print(delay_duration, update_flag)
    if update_flag and delay_duration == 0:
        print("UPDATE")
        update_flag = False
        update()

    flag = False
    for file in watched_files:
        mtime = os.stat(file).st_mtime
        if file not in last_mtimes or last_mtimes[file] < mtime:
            last_mtimes[file] = mtime
            flag = True
    if flag:
        update_flag = True
        delay_duration = DELAY
    time.sleep(DELTA)
