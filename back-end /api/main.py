import os
 
# تحديد مجلد للكاش داخل Docker
os.environ['TRANSFORMERS_CACHE'] = '/tmp/huggingface_cache'
os.environ['HF_HOME'] = '/tmp/huggingface'
 
from flask import Flask, request, jsonify
from sentence_transformers import SentenceTransformer
from pinecone import Pinecone
import google.generativeai as genai
from langdetect import detect

# قاموس التحيات
greetings_dict = {
    "السلام عليكم": "وعليكم السلام",
    "صباح الخير": "صباح النور",
    "مساء الخير": "مساء النور",
    "أهلا": "أهلا بيك",
    "أهلاً": "أهلاً وسهلاً",
    "هاي": "هاي",
    "هلا": "هلا فيك",
    "hello": "hello!",
    "hi": "hi!",
    "hey": "hey there!",
    "ازيك": "الحمد لله، انت عامل ايه؟",
    "ازيك؟": "الحمد لله، انت عامل ايه؟"
}

def check_greeting(question):
    for greeting in greetings_dict:
        if greeting.lower() in question.lower():
            return greetings_dict[greeting]
    return None
 
# تهيئة الموديلات
embedding_model = SentenceTransformer("intfloat/multilingual-e5-large")
 
pc = Pinecone(api_key="#")
index = pc.Index("newindex")
 
genai.configure(api_key="#")
model = genai.GenerativeModel("gemini-2.0-flash")
 
app = Flask(__name__)
chat_history = []
 
def detect_language(text):
    try:
        return detect(text)
    except:
        return "unknown"
 
def get_answer_from_pinecone(user_question, embedding_model, index, top_k=5, similarity_threshold=0.7):
    try:
        question_vector = embedding_model.encode(user_question).tolist()
    except Exception as e:
        return [f"❌ Error embedding question: {e}"]
 
    try:
        search_result = index.query(
            vector=question_vector,
            top_k=top_k,
            include_metadata=True
        )
    except Exception as e:
        return [f"❌ Error querying Pinecone: {e}"]
 
    matches = [m for m in search_result.matches if m.score >= similarity_threshold]
    sorted_matches = sorted(matches, key=lambda x: x.score, reverse=True)
 
    answers = []
    for m in sorted_matches:
        answer = m.metadata.get('answer', '').strip()
        source = m.metadata.get('source', 'unknown')
        score = round(m.score, 3)
        if answer:
            answers.append(f"• ({score}) from [{source}]:\n{answer}")
    return answers if answers else ["⚠️ No similar answers found."]
 
def ask_gemini_with_combined_answer(user_question, pinecone_answers=[], history=[]):
    context = "\n".join([f"👤 {q}\n🤖 {a}" for q, a in history])
    extracted_info = "\n".join([f"• {ans}" for ans in pinecone_answers]) if pinecone_answers else "None"
    lang = detect_language(user_question)
 
    if lang == "ar":
        
        instructions = """
❗ هام: استخدم فقط المعلومات من قاعدة البيانات.
📜 المحادثة السابقة:
{context}
👤 المستخدم يسأل: {user_question}
📚 معلومات من قاعدة البيانات:
{extracted_info}
📌 الرد:
"""
    else:
        
        instructions = """
❗ Important: Use only database information.
📜 Previous conversation:
{context}
👤 User asks: {user_question}
📚 Retrieved info:
{extracted_info}
📌 Response:
"""
 
    prompt = instructions.format(
        context=context or ("لا يوجد" if lang == "ar" else "None"),
        user_question=user_question,
        extracted_info=extracted_info
    )
    response = model.generate_content(prompt)
    return response.text.strip()
 
@app.route("/ask", methods=["POST"])
def ask():
    data = request.json
    question = data.get("question")
    if not question:
        return jsonify({"error": "Missing question"}), 400

    # التحقق من التحيات
    greeting_response = check_greeting(question)
    if greeting_response:
        return jsonify({"answer": greeting_response})

    pinecone_answer = get_answer_from_pinecone(question, embedding_model, index)
    final_answer = ask_gemini_with_combined_answer(question, pinecone_answer, chat_history)
    chat_history.append((question, final_answer))
    return jsonify({
        "answer": final_answer
    })
 
@app.route("/")
def home():
    return "🤖 API is running. Use POST /ask with {'question': '...'}"
 
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=7860)
