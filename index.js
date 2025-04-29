import express, { request, response } from "express";
const app = express();

app.use(express.json());

let persons = [
  {
    id: "1",
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: "2",
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: "3",
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: "4",
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

app.get("/api/persons", (request, response) => {
  response.json(persons);
});

app.get("/info", (request, response) => {
  response.send(
    `<p>Phonebook has info for ${persons.length} people</p>
      <p>${new Date()}</p>`,
  );
});

app.get("/api/persons/:id", (request, response) => {
  const id = request.params.id;
  const person = persons.find((person) => person.id === id);
  if (person) {
    response.json(person);
  } else {
    response.status(404).end();
  }
});

app.delete("/api/persons/:id", (request, response) => {
  const id = request.params.id;
  persons = persons.filter((person) => person.id !== id);
  response.status(204).end();
});

const newId = Math.floor(Math.random() * 1000000); // Generate a random ID

const isUniqueName = (name) => {
  return persons.find((person) => person.name === name) === undefined;
};

app.post("/api/persons", (request, response) => {
  if (!request.body.name) {
    return response.status(400).json({
      error: "The name is missing",
    });
  }

  if (!request.body.number) {
    return response.status(400).json({
      error: "The number is missing",
    });
  }

  if (isUniqueName(request.body.name)) {
    const person = {
      id: newId.toString(),
      name: request.body.name,
      number: request.body.number,
    };
    persons = persons.concat(person);
    response.json(person);
  } else {
    return response.status(400).json({
      error: "The name must be unique",
    });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
