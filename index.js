require("dotenv").config();

const express = require("express");
const app = express();
const morgan = require("morgan");
const cors = require("cors");
const Person = require("./models/person.js");

app.use(express.json());
app.use(cors());
app.use(express.static("dist"));

morgan.token("post", (req) => {
  return req.method === "POST" ? JSON.stringify(req.body) : " ";
});

app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :post"),
);

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "Unknown endpoint" });
};
const errorHandler = (err, req, res, next) => {
  console.error("Error name:", err.name);
  console.error("Error message:", err.message);

  if (err.name === "CastError") {
    return res.status(400).json({ error: "Unknown id" });
  } else if (err.name === "ValidationError") {
    return res.status(400).json({ error: err.message });
  }

  return res.status(500).json({ error: "Internal server error" });
};

app.get("/api/persons", (request, response) => {
  Person.find({}).then((persons) => {
    response.json(persons);
  });
});

app.get("/info", (request, response) => {
  Person.find({}).then((persons) => {
    response.send(
      `<p>Phonebook has info for ${persons.length} people</p>
      <p>${new Date()}</p>`,
    );
  });
});

app.get("/api/persons/:id", (request, response, next) => {
  Person.findById(request.params.id)
    .then((person) => {
      if (person) {
        response.json(person);
      } else {
        response.status(404).end();
      }
    })
    .catch((error) => next(error));
});

app.delete("/api/persons/:id", async (request, response, next) => {
  const id = request.params.id;

  try {
    const result = await Person.findByIdAndDelete(id);

    if (!result) {
      return response.status(404).json({ error: "Person not found" });
    }

    response.status(204).end();
  } catch (error) {
    next(error);
  }
});

app.post("/api/persons", (request, response, next) => {
  const { name, number } = request.body;

  if (!name && !number) {
    return response.status(400).json({
      error: "name and number missing",
    });
  }

  if (!name) {
    return response.status(400).json({
      error: "name missing",
    });
  }

  if (!number) {
    return response.status(400).json({
      error: "number missing",
    });
  }

  const person = new Person({
    name,
    number,
  });
  person
    .save()
    .then((savedPerson) => {
      response.json(savedPerson);
    })
    .catch((error) => {
      next(error);
    });
});

app.use(errorHandler);
app.use(unknownEndpoint);

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
