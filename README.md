AUTO/
│
├── backend/
│   ├── app.py
│   ├── config.py
│   └── utils/
│
├── frontend/
│   ├── index.html
│   ├── css/
│   └── js/
│
├── sample_data.csv
└── README.md
python -m venv venv
venv\Scripts\activate   # Windows
pip install -r backend/requirements.txt

cd backend
python app.py

cd ../frontend
python -m http.server 8000
What I Learned From This

How to structure an ML project properly

Connecting frontend and backend using APIs

Writing modular ML pipelines

Managing project structure cleanly

Thinking about scalability instead of just writing notebook code

This project is still evolving, and I plan to keep improving it as I learn more.