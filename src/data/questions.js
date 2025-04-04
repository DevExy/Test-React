export const questions = [
    {
      text: 'What is the output of print(2 ** 3)?',
      options: [
        { id: 1, text: '6', isCorrect: false },
        { id: 2, text: '8', isCorrect: true },
        { id: 3, text: '9', isCorrect: false },
        { id: 4, text: '5', isCorrect: false },
      ],
      explanation: 'The ** operator in Python represents exponentiation. 2 ** 3 = 2³ = 8.',
    },
    {
      text: 'Which keyword is used to define a function in Python?',
      options: [
        { id: 1, text: 'func', isCorrect: false },
        { id: 2, text: 'def', isCorrect: true },
        { id: 3, text: 'function', isCorrect: false },
        { id: 4, text: 'define', isCorrect: false },
      ],
      explanation: 'In Python, the "def" keyword is used to define a function.',
    },
    {
      text: 'What is the correct file extension for Python files?',
      options: [
        { id: 1, text: '.pyth', isCorrect: false },
        { id: 2, text: '.pt', isCorrect: false },
        { id: 3, text: '.py', isCorrect: true },
        { id: 4, text: '.python', isCorrect: false },
      ],
      explanation: 'Python files use the .py extension.',   
    },
    {
      text: 'Which of these is NOT a Python data type?',
      options: [
        { id: 1, text: 'List', isCorrect: false },
        { id: 2, text: 'Tuple', isCorrect: false },
        { id: 3, text: 'ArrayList', isCorrect: true },
        { id: 4, text: 'Dictionary', isCorrect: false },
      ],
      explanation: 'ArrayList is a Java data structure, not a Python data type.',
    },
    {
      text: 'How do you create a comment in Python?',
      options: [
        { id: 1, text: '//', isCorrect: false },
        { id: 2, text: '#', isCorrect: true },
        { id: 3, text: '/*', isCorrect: false },
        { id: 4, text: '--', isCorrect: false },
      ],
      explanation: 'Python uses the # symbol for single-line comments.',
    },
    {
      text: 'What does the len() function do?',
      options: [
        { id: 1, text: 'Returns the length of an object', isCorrect: true },
        { id: 2, text: 'Adds an element to a list', isCorrect: false },
        { id: 3, text: 'Removes an element', isCorrect: false },
        { id: 4, text: 'Checks a condition', isCorrect: false },
      ],
      explanation: 'The len() function returns the number of items in an object.',
    },
    {
      text: 'Which operator is used for string concatenation in Python?',
      options: [
        { id: 1, text: '+', isCorrect: true },
        { id: 2, text: '&', isCorrect: false },
        { id: 3, text: '||', isCorrect: false },
        { id: 4, text: '*', isCorrect: false },
      ],
      explanation: 'Python uses the + operator to concatenate strings.',
    },
    {
      text: 'What is the output of print(type([]))?',
      options: [
        { id: 1, text: '<class "str">', isCorrect: false },
        { id: 2, text: '<class "list">', isCorrect: true },
        { id: 3, text: '<class "tuple">', isCorrect: false },
        { id: 4, text: '<class "dict">', isCorrect: false },
      ],
      explanation: 'The empty square brackets [] create an empty list.',
    },
    {
      text: 'Which method adds an item to the end of a list?',
      options: [
        { id: 1, text: 'insert()', isCorrect: false },
        { id: 2, text: 'append()', isCorrect: true },
        { id: 3, text: 'add()', isCorrect: false },
        { id: 4, text: 'push()', isCorrect: false },
      ],
      explanation: 'The append() method adds an item to the end of a list.',
    },
    {
      text: 'What is Python primarily known for?',
      options: [
        { id: 1, text: 'Game development', isCorrect: false },
        { id: 2, text: 'Web development', isCorrect: false },
        { id: 3, text: 'Ease of use and readability', isCorrect: true },
        { id: 4, text: 'Low-level system programming', isCorrect: false },
      ],
      explanation: 'Python is famous for its simple syntax and readability.',
    },
  ];