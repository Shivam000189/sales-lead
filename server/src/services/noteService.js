const Note = require("../models/Note");
const {createActivity} = require("./activityService");


// Create Note
const createNote = async (
  leadId,
  userId,
  text
)=>{


  const note = await Note.create({
    leadId,
    userId,
    text,
  });


  await createActivity(
    leadId,
    "Note Added",
    userId,
    "NOTE_ADDED"
  );


  return note;
};


// Get Lead Notes
const getNotesByLead = async (leadId) => {

  return await Note.find({
    leadId,
  })
  .populate("userId", "name email role")
  .sort({
    createdAt: -1,
  });

};


// Create Contact Note
const createContactNote = async (
  contactId,
  userId,
  text
) => {
  const note = await Note.create({
    contactId,
    userId,
    text,
  });

  return note;
};

// Get Contact Notes
const getNotesByContact = async (contactId) => {
  return await Note.find({
    contactId,
  })
    .populate("userId", "name email role")
    .sort({
      createdAt: -1,
    });
};

// Delete Note
const deleteNote = async (noteId) => {
  return await Note.findByIdAndDelete(noteId);
};

module.exports = {
  createNote,
  createContactNote,
  getNotesByLead,
  getNotesByContact,
  deleteNote,
};