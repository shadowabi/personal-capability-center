"""
Test script: Insert one mock data to ai-memory database
"""

import sys
import os

# Add skill root directory to Python path
script_dir = os.path.dirname(os.path.abspath(__file__))
skill_root = os.path.dirname(script_dir)
sys.path.insert(0, skill_root)

from scripts.ai_memory import AIMemory, generate_mock_embedding

def main():
    print("=" * 60)
    print(" Test: Insert mock data to ai-memory")
    print("=" * 60)

    # Generate mock embedding
    print("\n[1/3] Generating mock embedding...")
    embedding = generate_mock_embedding(dimension=1536)
    print(f"[OK] Generated 1536-dimensional vector")

    # Connect to database and write data
    print("\n[2/3] Connecting to database and writing data...")
    try:
        with AIMemory() as memory:
            conv_id = memory.add_conversation(
                title='Test Conversation',
                summary='This is a test conversation to verify ai-memory system',
                details='Test data: Verify database write functionality works correctly. This record contains title, summary, details, tags and importance rating.',
                embedding=embedding,
                tags=['test', 'mock-data'],
                importance=5,
                word_count=20
            )
            print(f"[OK] Successfully wrote data, conversation ID: {conv_id}")
    except Exception as e:
        print(f"[FAIL] Write failed: {e}")
        return False

    # Verify data
    print("\n[3/3] Verifying data...")
    try:
        with AIMemory() as memory:
            stats = memory.get_statistics()
            print(f"[OK] Database currently has {stats['total_conversations']} conversations")
            recent = memory.get_recent(days=1, limit=1)
            if recent:
                print(f"[OK] Latest conversation: {recent[0][1]} (ID: {recent[0][0]})")
    except Exception as e:
        print(f"[FAIL] Verification failed: {e}")

    print("\n" + "=" * 60)
    print(" [OK] Test completed!")
    print("=" * 60)
    return True

if __name__ == "__main__":
    try:
        success = main()
        sys.exit(0 if success else 1)
    except Exception as e:
        print(f"\nError: {e}")
        sys.exit(1)
