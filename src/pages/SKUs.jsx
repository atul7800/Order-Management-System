import React, {useState, useEffect} from "react";
import Button from "../components/Button";
import {useToast} from "../context/ToastContext";

export default function SKUPage() {
  const [skus, setSkus] = useState([]);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [price, setPrice] = useState("");
  const {showToast} = useToast();

  useEffect(() => {
    fetch("http://localhost:3000/skus")
      .then((res) => res.json())
      .then((data) => setSkus(data));
  }, []);

  const handleAdd = async () => {
    if (!name || !code || price < 0) {
      showToast("Invalid input");
      return;
    }
    const newSKU = {name, code, price: Number(price), active: true};
    const res = await fetch("http://localhost:3000/skus", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(newSKU),
    });
    const added = await res.json();
    setSkus([...skus, added]);
    showToast("SKU Added");
    setName("");
    setCode("");
    setPrice("");
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">SKU Management</h2>
      <div className="grid grid-cols-3 gap-4 mb-4">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="SKU Name"
          className="p-2 border rounded"
        />
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="SKU Code"
          className="p-2 border rounded"
        />
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Price"
          className="p-2 border rounded"
        />
      </div>
      <Button onClick={handleAdd}>Add SKU</Button>
      <div className="mt-8">
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2">Name</th>
              <th className="p-2">Code</th>
              <th className="p-2">Price</th>
              <th className="p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {skus.map((sku, i) => (
              <tr key={i} className="text-center border-t">
                <td className="p-2">{sku.name}</td>
                <td className="p-2">{sku.code}</td>
                <td className="p-2">${sku.price}</td>
                <td className="p-2">{sku.active ? "Active" : "Inactive"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
