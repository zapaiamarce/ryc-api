import * as Airtable from "airtable";

const base = new Airtable({ apiKey: "key3qcgZDloxOJaCT" }).base("apphHYI2yzb4a8oBa");


export const addCook = async newCook => {
  new Promise((res, rej) => {
    base("cocineros").create(newCook, function(err, record) {
      if (err) rej(err);
      res(record);
    });
  });
}

export const addFoodie = async newFoodie => {
  new Promise((res, rej) => {
    base("foodies").create(newFoodie, function(err, record) {
      if (err) rej(err);
      res(record);
    });
  });
}

