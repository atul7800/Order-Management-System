import React, {useState, useEffect} from "react";
import {useToast} from "../context/ToastContext";
import Button from "../components/Button";

export default function CreateOrderPage() {
  const {showToast} = useToast();
  const [skus, setSkus] = useState([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "",
    items: [],
  });

  const addItem = () => {
    setForm({
      ...form,
      items: [...form.items, {skuId: "", qty: 1}],
    });
  };

  const updateItem = (index, key, value) => {
    const items = [...form.items];
    items[index][key] = value;
    setForm({...form, items});
  };

  const total = form.items.reduce((sum, item) => {
    const sku = skus.find((s) => s.id === parseInt(item.skuId));
    return sku ? sum + sku.price * item.qty : sum;
  }, 0);

  const handleSubmit = async () => {
    if (
      !form.name ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) ||
      !/^\d{10}$/.test(form.phone)
    ) {
      showToast("Invalid customer details");
      return;
    }
    const order = {
      ...form,
      total,
      status: "New",
      createdAt: new Date().toISOString(),
    };
    await fetch("http://localhost:3000/orders", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(order),
    });
    showToast("Order Created");
    setForm({
      name: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      country: "",
      items: [],
    });
  };

  useEffect(() => {
    fetch("http://localhost:3000/skus")
      .then((res) => res.json())
      .then((data) => setSkus(data.filter((s) => s.active)));
  }, []);

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">Create Order</h2>
      <div className="grid grid-cols-2 gap-4">
        <input
          placeholder="Full Name"
          value={form.name}
          onChange={(e) => setForm({...form, name: e.target.value})}
          className="p-2 border rounded"
        />
        <input
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({...form, email: e.target.value})}
          className="p-2 border rounded"
        />
        <input
          placeholder="Phone"
          value={form.phone}
          onChange={(e) => setForm({...form, phone: e.target.value})}
          className="p-2 border rounded"
        />
        <input
          placeholder="Address"
          value={form.address}
          onChange={(e) => setForm({...form, address: e.target.value})}
          className="p-2 border rounded"
        />
        <input
          placeholder="City"
          value={form.city}
          onChange={(e) => setForm({...form, city: e.target.value})}
          className="p-2 border rounded"
        />
        <input
          placeholder="Country"
          value={form.country}
          onChange={(e) => setForm({...form, country: e.target.value})}
          className="p-2 border rounded"
        />
      </div>

      <div className="mt-6">
        <h3 className="font-semibold mb-2">Order Items</h3>
        {form.items.map((item, i) => (
          <div key={i} className="grid grid-cols-3 gap-2 mb-2">
            <select
              value={item.skuId}
              onChange={(e) => updateItem(i, "skuId", e.target.value)}
              className="p-2 border rounded"
            >
              <option value="">Select SKU</option>
              {skus.map((sku) => (
                <option key={sku.id} value={sku.id}>
                  {sku.name} - {sku.code}
                </option>
              ))}
            </select>
            <input
              type="number"
              value={item.qty}
              onChange={(e) =>
                updateItem(i, "qty", Math.max(1, parseInt(e.target.value)))
              }
              className="p-2 border rounded"
            />
            <div className="p-2 border rounded bg-gray-100">
              ₹
              {(() => {
                const sku = skus.find((s) => s.id === parseInt(item.skuId));
                return sku ? sku.price * item.qty : 0;
              })()}
            </div>
          </div>
        ))}
        <Button onClick={addItem} className="mt-2">
          Add Item
        </Button>
      </div>

      <div className="mt-6 font-bold">Total: ₹{total}</div>

      <Button onClick={handleSubmit} className="mt-4">
        Submit Order
      </Button>
    </div>
  );
}
