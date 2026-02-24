# -*- coding: utf-8 -*-
import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

import os
os.chdir(r'C:\Users\shadow\.config\opencode\skills\ai-memory')
sys.path.insert(0, '.')

from scripts.ai_memory import AIMemory

memory = AIMemory()
result = memory.get_conversation(27)

if result:
    print('=== 对话ID:', result[0], '===')
    print('日期:', result[1])
    print('\n【标题】')
    print(result[2])
    print('\n【摘要】')
    print(result[3])
    print('\n【详细信息】')
    print(result[4])
    print('\n【标签】', result[5])
    print('【重要性】', result[6])
    print('【字数】', result[7])
    print('【创建时间】', result[8])
    print('【更新时间】', result[9])
else:
    print('未找到id=27的记录')

memory.close()
