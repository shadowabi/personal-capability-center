import psycopg2
import numpy as np

conn = psycopg2.connect(host='localhost', port=5432, database='ai_memory', user='ai_user', password='ai_password_123')
cur = conn.cursor()

full_details = """React组件设计模式学习：

组件分类：
- 展示组件（Presentational）：负责UI渲染
- 容器组件（Container）：负责数据逻辑
- 受控组件 vs 非受控组件

常用设计模式：
1. 复合组件（Compound Components）
   - 优点：灵活、可扩展
   - 适用场景：复杂UI如Tabs、Select

2. Render Props
   - 共享逻辑代码
   - 缺点：嵌套地狱

3. 高阶组件（HOC）
   - 复用组件逻辑
   - 缺点：prop命名冲突

4. 自定义Hooks
   - 推荐方式
   - 更好的组合逻辑

最佳实践：
1. 组件保持单一职责
2. 合理拆分组件
3. 使用TypeScript确保类型安全
4. 避免不必要的组件嵌套"""

embedding = np.random.rand(1536).tolist()

cur.execute('''
    INSERT INTO conversations (date, title, summary, details, embedding, tags, importance, word_count)
    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
    RETURNING id;
''', (
    '2026-02-20',
    'React组件设计模式',
    '学习React常用组件设计模式，包括复合组件、Render Props、HOC和自定义Hooks',
    full_details,
    embedding,
    ['React', '前端', '组件设计', '设计模式', 'TypeScript'],
    8,
    180
))

new_id = cur.fetchone()[0]
conn.commit()

print('插入成功！对话ID:', new_id)
print('内容长度:', len(full_details), '字符')

cur.execute('SELECT id, title, importance, LENGTH(details) as content_length FROM conversations WHERE id = %s;', (new_id,))
result = cur.fetchone()
print('验证:')
print('  ID:', result[0])
print('  标题:', result[1])
print('  重要性:', result[2])
print('  内容长度:', result[3], '字符')

cur.close()
conn.close()
