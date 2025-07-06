FROM python:3.10-slim

WORKDIR /app

# ننسخ المتطلبات ونثبتها
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# إنشاء مجلد الكاش وإعطائه صلاحيات مناسبة
RUN mkdir -p /tmp/huggingface_cache && chmod -R 777 /tmp/huggingface_cache
RUN mkdir -p /tmp/huggingface && chmod -R 777 /tmp/huggingface

# ننسخ بقية الملفات
COPY . .

EXPOSE 7860

CMD ["python", "main.py"]

