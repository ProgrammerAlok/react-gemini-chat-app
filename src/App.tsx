import { useCallback, useEffect, useState } from "react";
import "./App.css";
import { GoogleGenerativeAI } from "@google/generative-ai";
import MasterSheet from "./utils/data/mastersheet.data.json";
import Addon from "./utils/data/addon.data.json";

interface MasterSheet {
  _id: string;
  itemName: string;
  quantity: number;
}

function App() {
  const [data, setData] = useState<MasterSheet[]>();

  const [masterSheets] = useState(() =>
    MasterSheet.map(({ _id, itemName, isRented }) => ({
      _id,
      itemName,
      isRented,
    }))
  );

  const f = useCallback(async () => {
    const genAI = new GoogleGenerativeAI(import.meta.env.VITE_API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      // model: "tunedModels/copy-of-if-num-is-odd-then-num-else-nu-x",
    });

    // const prompt = "Write a story about a magic backpack.";

    const result = await model.generateContent(
      `
      ${JSON.stringify(masterSheets)}
      
      the above list is master sheet.
      
      i need red baloon 200, blue baloon 10, green baloon 400, rang stnd 5pcs.
      
      now give me proper output of item with structure _id:itemName:quantity:isRented (if unit is mentioned in quantity the write the unit if quantiry is not mentioned the write 0) match the item _id with master sheet, and each items are seperated by | give me a string output please do not add any extra words or space or special characters or symbol.

      please don't remember the previous quantity.
      `
    );

    const t = result.response.text();
    const rrr = t.split("|").map((item) => {
      const [id, _itemName, _quantity, _isRented] = item.split(":");
      return {
        _id: id.trim(),
        itemName: _itemName.trim(),
        quantity: parseInt(_quantity.trim()),
        isRented: _isRented.trim() === "true",
      };
    });

    console.info(t);
    console.info(rrr);

    setData(rrr);
  }, [masterSheets]);

  useEffect(() => {
    f();
  }, [f]);

  return (
    <div>
      <div>promt</div>
      <div>
        {data?.map(({ _id, itemName, quantity }, ind) => (
          <div key={ind}>
            {_id} : {itemName} : {quantity}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
