from flask import Flask, render_template, request, jsonify, session
from datetime import datetime

app = Flask(__name__)
app.secret_key = 'votre_cle_secrete_complexe_ici'  # Changez ceci pour une clé sécurisée en production

# Nouvelle méthode pour initialiser la session
@app.before_request
def init_session():
    if 'history' not in session:
        session['history'] = []
    if 'memory' not in session:
        session['memory'] = 0

@app.route('/', methods=['GET', 'POST'])
def calculatrice():
    if request.method == 'POST':
        # Gestion des différentes actions
        action = request.form.get('action')
        
        if action == 'calculate':
            return handle_calculation()
        elif action == 'clear':
            return handle_clear()
        elif action == 'memory_add':
            return handle_memory('add')
        elif action == 'memory_recall':
            return handle_memory('recall')
        
    return render_template('index.html')

def handle_calculation():
    try:
        num1 = float(request.form.get('num1', 0))
        num2 = float(request.form.get('num2', 0))
        operation = request.form.get('operation')
        
        operations = {
            'add': ('+', lambda a, b: a + b),
            'subtract': ('-', lambda a, b: a - b),
            'multiply': ('×', lambda a, b: a * b),
            'divide': ('÷', lambda a, b: a / b if b != 0 else 'Erreur: Division par zéro'),
            'power': ('^', lambda a, b: a ** b),
            'sqrt': ('√', lambda a, b: a ** 0.5)
        }
        
        if operation in operations:
            symbol, func = operations[operation]
            if operation == 'sqrt':
                result = func(num1)
                expression = f"{symbol}({num1}) = {result}"
            else:
                result = func(num1, num2)
                expression = f"{num1} {symbol} {num2} = {result}"
            
            # Ajout à l'historique
            timestamp = datetime.now().strftime("%H:%M:%S")
            session['history'].append({
                'time': timestamp,
                'expression': expression,
                'result': result if isinstance(result, (int, float)) else str(result)
            })
            session.modified = True
            
            return jsonify({
                'status': 'success',
                'result': result,
                'history': session['history'][-5:]  # Retourne les 5 derniers calculs
            })
            
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)})
    
    return jsonify({'status': 'error', 'message': 'Opération non valide'})

def handle_clear():
    session['history'] = []
    session.modified = True
    return jsonify({'status': 'success', 'history': []})

def handle_memory(action):
    if 'memory' not in session:
        session['memory'] = 0
        
    if action == 'add':
        try:
            value = float(request.form.get('value', 0))
            session['memory'] += value
            session.modified = True
            return jsonify({'status': 'success', 'memory': session['memory']})
        except:
            return jsonify({'status': 'error', 'message': 'Valeur mémoire invalide'})
    elif action == 'recall':
        return jsonify({'status': 'success', 'value': session['memory']})

if __name__ == '__main__':
    app.run(debug=True)