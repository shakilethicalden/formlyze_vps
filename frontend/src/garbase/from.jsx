import React, { useState } from "react";
import { Plus, Trash2, Pencil, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";

const fieldTypes = ["text", "number", "date", "file", "radio", "checkbox", "select"];

const form = () => {
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [fields, setFields] = useState([]);
  const [optionInputs, setOptionInputs] = useState({});

  const handleAddField = () => {
    setFields([
      ...fields,
      {
        heading: "",
        type: "text",
        description: "",
        options: [],
        isEditing: true,
      },
    ]);
  };

  const handleFieldChange = (index, key, value) => {
    const updated = [...fields];
    updated[index][key] = value;
    setFields(updated);
  };

  const handleAddOption = (index) => {
    const option = optionInputs[index]?.trim();
    if (!option) return;

    const updated = [...fields];
    if (!updated[index].options.includes(option)) {
      updated[index].options.push(option);
      setFields(updated);
    }
    setOptionInputs({ ...optionInputs, [index]: "" });
  };

  const handleRemoveOption = (index, option) => {
    const updated = [...fields];
    updated[index].options = updated[index].options.filter((o) => o !== option);
    setFields(updated);
  };

  const handleDeleteField = (index) => {
    const updated = [...fields];
    updated.splice(index, 1);
    setFields(updated);
  };

  const handleSaveField = (index) => {
    const updated = [...fields];
    updated[index].isEditing = false;
    setFields(updated);
  };

  const handleEditField = (index) => {
    const updated = [...fields];
    updated[index].isEditing = true;
    setFields(updated);
  };

  const handlePublish = () => {
    const formObject = {
      formName,
      formDescription,
      fields: fields.map(({ isEditing, ...rest }) => rest),
    };
    console.log("Published Form:", formObject);
    alert(JSON.stringify(formObject, null, 2));
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <Input
          placeholder="Form Title"
          value={formName}
          onChange={(e) => setFormName(e.target.value)}
          className="text-xl font-semibold"
        />
        <Textarea
          placeholder="Form Description"
          value={formDescription}
          onChange={(e) => setFormDescription(e.target.value)}
        />
      </div>

      {fields.map((field, index) => (
        <div
          key={index}
          className="bg-white p-4 rounded-lg shadow space-y-3 relative border border-gray-200"
        >
          {field.isEditing ? (
            <>
              <Input
                placeholder="Field Heading"
                value={field.heading}
                onChange={(e) => handleFieldChange(index, "heading", e.target.value)}
              />
              <Textarea
                placeholder="Field Description"
                value={field.description}
                onChange={(e) => handleFieldChange(index, "description", e.target.value)}
              />
              <Select
                onValueChange={(value) => handleFieldChange(index, "type", value)}
                value={field.type}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Field Type" />
                </SelectTrigger>
                <SelectContent>
                  {fieldTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {(field.type === "checkbox" || field.type === "radio" || field.type === "select") && (
                <div>
                  <div className="flex gap-2 mb-2">
                    <Input
                      placeholder="Add Option"
                      value={optionInputs[index] || ""}
                      onChange={(e) => setOptionInputs({ ...optionInputs, [index]: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddOption(index);
                        }
                      }}
                    />
                    <Button onClick={() => handleAddOption(index)}>Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {field.options.map((option, i) => (
                      <div
                        key={i}
                        className="bg-gray-200 px-3 py-1 rounded-full flex items-center gap-2"
                      >
                        <span>{option}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveOption(index, option)}
                          className="text-red-500 font-bold"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex gap-2">
                <Button variant="default" onClick={() => handleSaveField(index)}>
                  <Save className="w-4 h-4 mr-1" /> Save Field
                </Button>
                <Button variant="destructive" onClick={() => handleDeleteField(index)}>
                  <Trash2 className="w-4 h-4 mr-1" /> Delete
                </Button>
              </div>
            </>
          ) : (
            <div>
              <h3 className="text-lg font-medium">{field.heading}</h3>
              <p className="text-gray-600">{field.description}</p>
              <p className="text-sm italic">Type: {field.type}</p>
              {field.options.length > 0 && (
                <ul className="list-disc ml-6 text-sm">
                  {field.options.map((opt, i) => (
                    <li key={i}>{opt}</li>
                  ))}
                </ul>
              )}
              <Button
                variant="outline"
                onClick={() => handleEditField(index)}
                className="mt-2"
              >
                <Pencil className="w-4 h-4 mr-1" /> Edit
              </Button>
            </div>
          )}
        </div>
      ))}

      <div className="flex gap-4 justify-between items-center mt-6">
        <Button onClick={handleAddField} className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Field
        </Button>
        <Button onClick={handlePublish} variant="success">
          Publish Form
        </Button>
      </div>
    </div>
  );
};

export default form;
