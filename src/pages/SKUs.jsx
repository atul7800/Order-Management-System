import React, {useState, useEffect} from "react";
import Button from "../components/Button";
import {useToast} from "../context/ToastContext";
import {FiPlus, FiMoreVertical} from "react-icons/fi";
import {FcSearch} from "react-icons/fc";

export default function SKUPage() {
  const [skus, setSkus] = useState([]);
  const [filteredSkus, setFilteredSkus] = useState([]);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [price, setPrice] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [menuOpen, setMenuOpen] = useState(null);
  const {showToast} = useToast();

  useEffect(() => {
    fetch("http://localhost:3000/skus")
      .then((res) => res.json())
      .then((data) => {
        setSkus(data);
        setFilteredSkus(data);
      });
  }, []);

  useEffect(() => {
    let result = skus;
    if (statusFilter !== "All") {
      const isActive = statusFilter === "Active";
      result = result.filter((sku) => sku.active === isActive);
    }
    if (searchTerm.trim()) {
      result = result.filter(
        (sku) =>
          sku.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sku.code.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredSkus(result);
  }, [statusFilter, searchTerm, skus]);

  const handleAdd = async () => {
    if (!name || !code || price < 0) {
      showToast("Invalid input");
      return;
    }

    if (editingId) {
      //Edit SKU
      const res = await fetch(`http://localhost:3000/skus/${editingId}`, {
        method: "PUT",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({name, code, price: Number(price), active: true}),
      });
      const updatedSku = await res.json();
      const updated = skus.map((sku) =>
        sku.id === editingId ? updatedSku : sku
      );
      setSkus(updated);
      showToast("SKU Updated");
    } else {
      const newSKU = {name, code, price: Number(price), active: true};
      const res = await fetch("http://localhost:3000/skus", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(newSKU),
      });
      const added = await res.json();
      const updated = [...skus, added];
      setSkus(updated);
      showToast("SKU Added");
    }

    setName("");
    setCode("");
    setPrice("");
    setEditingId(null);
  };

  const handleEdit = (sku) => {
    setName(sku.name);
    setCode(sku.code);
    setPrice(sku.price);
    setEditingId(sku.id);
    setMenuOpen(null);
  };

  const handleDelete = async (skuId) => {
    await fetch(`http://localhost:3000/skus/${skuId}`, {method: "DELETE"});
    setSkus((prev) => prev.filter((sku) => sku.id !== id));
    showToast("SKU Deleted");
    setMenuOpen(null);
  };

  const toggleStatus = async (sku) => {
    const res = await fetch(`http://localhost:3000/skus/${sku.id}`, {
      method: "PATCH",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({active: !sku.active}),
    });
    const updatedSku = await res.json();
    const updated = skus.map((s) => (s.id === sku.id ? updatedSku : s));
    setSkus(updated);
    showToast(`SKU marked as ${updatedSku.active ? "Active" : "Inactive"}`);
    setMenuOpen(null);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="bg-white shadow-[0_0_12px_rgba(0,0,0,0.08)] rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          SKU Management
        </h2>

        {/* Filter + Search */}
        <div className="flex flex-wrap gap-4 mb-6 items-center">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="All">All</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
          <div className="flex items-center border rounded pl-3">
            <FcSearch size={18} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search"
              className="p-2 pl-3 focus:outline-none border-none rounded w-full sm:w-64"
            />
          </div>
        </div>

        {/* Add SKU inline */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6 items-center">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="SKU Name"
            className="p-2 border rounded w-full"
          />
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="SKU Code"
            className="p-2 border rounded w-full"
          />
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Price"
            className="p-2 border rounded w-full"
          />
          <Button
            onClick={handleAdd}
            className="flex justify-center items-center gap-2 w-full sm:w-auto"
          >
            <FiPlus size={18} />
            {editingId ? "Save" : "Add SKU"}
          </Button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left rounded-lg">
            <thead className="bg-blue-100 text-gray-700">
              <tr>
                <th className="p-3">S. No.</th>
                <th className="p-3">SKU Name</th>
                <th className="p-3">SKU Code</th>
                <th className="p-3">Price</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredSkus.map((sku, i) => (
                <tr
                  key={sku.id}
                  className={`${i % 2 === 0 ? "bg-white" : "bg-gray-100"}`}
                >
                  <td className="p-3">{i + 1}</td>
                  <td className="p-3 text-blue-700 font-medium">{sku.name}</td>
                  <td className="p-3">{sku.code}</td>
                  <td className="p-3">₹{sku.price}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        sku.active
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {sku.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="p-3 text-center relative">
                    <button
                      className="text-gray-500 font-bold hover:text-black"
                      onClick={() =>
                        setMenuOpen(menuOpen === sku.id ? null : sku.id)
                      }
                    >
                      <FiMoreVertical size={18} strokeWidth={2} />
                    </button>
                    {menuOpen === sku.id && (
                      <div className="absolute right-0 mt-2 w-32 bg-white border rounded shadow-md z-10">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleEdit(sku);
                          }}
                          className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDelete(sku.id);
                          }}
                          className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                        >
                          Delete
                        </button>
                        {/* <button
                          onClick={() => toggleStatus(sku)}
                          className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                        >
                          {sku.active ? "Inactive" : "Active"}
                        </button> */}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
