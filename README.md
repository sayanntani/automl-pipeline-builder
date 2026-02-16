AutoML Pipeline Builder

This is a web-based AutoML system I built to understand how real-world machine learning pipelines work.

Instead of manually doing preprocessing, model selection, tuning, and evaluation every time, I wanted to create something that automates the full workflow in one place.

This project is my attempt to combine Machine Learning + Backend + Frontend into one complete system.

>>>> Why I Built This

While learning ML, I realized most tutorials stop at training one model in a notebook.
But in real projects, we need:

Data cleaning

Feature engineering

Multiple model comparison

Hyperparameter tuning

Proper evaluation

So instead of repeating these steps manually, I tried to automate everything into a reusable pipeline.

This project helped me understand how ML systems actually work beyond just theory.

>>>> What It Can Do

Automatically detects whether the task is Classification or Regression

Trains multiple models and compares them

Performs hyperparameter tuning (Grid Search / Random Search)

Handles missing values, encoding, scaling, and feature selection

Generates performance metrics and leaderboard

Shows training progress

I also experimented with Neural Networks and ensemble models to explore more advanced ideas.

🛠 Tech Stack

Backend
Python
Flask
Scikit-learn
XGBoost
Pandas / NumPy
TensorFlow (for neural networks)
Frontend
HTML
CSS
JavaScript