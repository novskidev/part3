const mongoose = require("mongoose");

if (process.argv.length < 3) {
  console.log("give password as argument");
  process.exit(1);
}

const password = process.argv[2];
const name = process.argv[3];
const number = process.argv[4] ? process.argv[4] : "";

const url = `mongodb+srv://novskidev:${password}@cluster0.a6l6inr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

mongoose.set("strictQuery", false);
mongoose.connect(url);

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
});

const Person = mongoose.model("Person", personSchema);

const person = new Person({
  name,
  number,
});

if (process.argv.length === 3) {
  Person.find({}).then((persons) => {
    console.log("phonebook:");
    persons.forEach((person) => {
      console.log(person.name, person.number);
    });
    mongoose.connection.close();
  });
} else {
  person.save().then((result) => {
    mongoose.connection.close();
    console.log(
      `added ${person.name} ${
        person.number.length > 0 ? `number ${person.number}` : "without number"
      } to phonebook`,
    );
  });
}
