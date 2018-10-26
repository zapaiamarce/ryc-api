import { addCook, addFoodie } from "./lib/airtable";
import { omit } from "lodash";

const addEarlyAdopter = async event => {
  try {
    const { data } = event;
    const newEarlyAdopter = omit(data, "type");

    if (newEarlyAdopter.type == "FOODIE") {
      addFoodie(newEarlyAdopter);
    } else {
      addCook(newEarlyAdopter);
    }

    return {
      data: {
        message: "ok"
      }
    };
  } catch (e) {
    return {
      data: {
        message: "not ok",
        error: e.toString()
      }
    };
  }
};

export default async event => {
  try {
    return addEarlyAdopter(event);
  } catch (e) {
    console.log(e);
  }
};
