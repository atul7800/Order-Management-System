import React, {useState, useEffect} from "react";
import Button from "../components/Button";
import {useToast} from "../context/ToastContext";

export default function OrdersPage() {
  const {showToast} = useToast();
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [sortAsc, setSortAsc] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [nextStatus, setNextStatus] = useState("");
  const ORDERS_PER_PAGE = 10;

  const fetchOrders = async () => {
    const res = await fetch("http://localhost:3000/orders");
    const data = await res.json();
    setOrders(data);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = orders
    .filter((order) => {
      const matchesStatus = filter === "All" || order.status === filter;
      const matchesSearch =
        order.name.toLowerCase().includes(search.toLowerCase()) ||
        order.id?.toString().includes(search);
      return matchesStatus && matchesSearch;
    })
    .sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return sortAsc ? dateA - dateB : dateB - dateA;
    });

  const totalPages = Math.ceil(filteredOrders.length / ORDERS_PER_PAGE);
  const currentData = filteredOrders.slice(
    (currentPage - 1) * ORDERS_PER_PAGE,
    currentPage * ORDERS_PER_PAGE
  );

  const handleBulkUpdate = (status) => {
    if (selectedOrders.length === 0) {
      showToast("No order selected");
      return;
    }
    setNextStatus(status);
    setShowModal(true);
  };

  const confirmUpdate = () => {
    const updated = orders.map((order) =>
      selectedOrders.includes(order.id) ? {...order, status: nextStatus} : order
    );
    setOrders(updated);
    setSelectedOrders([]);
    showToast(`Updated to ${nextStatus}`);
    setShowModal(false);
  };

  const toggleSelection = (id) => {
    setSelectedOrders((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">
        Order Management
      </h2>

      <div className="flex flex-wrap gap-2 mb-6">
        {["All", "New", "Delivered", "Cancelled"].map((tab) => (
          <Button
            key={tab}
            onClick={() => {
              setFilter(tab);
              setCurrentPage(1);
            }}
            className={`rounded-full px-4 py-1 text-sm ${
              filter === tab
                ? "bg-green-700 text-white"
                : "bg-gray-300 text-black"
            }`}
          >
            {tab}
          </Button>
        ))}
      </div>

      <div className="flex flex-wrap gap-4 items-center mb-6">
        <input
          placeholder="Search by customer or order ID"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-2 border rounded w-full sm:w-auto flex-1"
        />
        <Button
          onClick={() => handleBulkUpdate("Delivered")}
          className="bg-green-600"
        >
          Mark Delivered
        </Button>
        <Button
          onClick={() => handleBulkUpdate("Cancelled")}
          className="bg-red-600"
        >
          Mark Cancelled
        </Button>
        <Button onClick={() => setSortAsc(!sortAsc)} className="bg-gray-700">
          Sort by Date {sortAsc ? "↑" : "↓"}
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border shadow-sm rounded-lg">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="text-left px-4 py-10">Select</th>
              <th className="text-left px-4 py-2">Order ID</th>
              <th className="text-left px-4 py-2">Customer</th>
              <th className="text-left px-4 py-2">Total (₹)</th>
              <th className="text-left px-4 py-2">Created</th>
              <th className="text-left px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {currentData.map((order) => (
              <tr key={order.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-2">
                  <input
                    type="checkbox"
                    checked={selectedOrders.includes(order.id)}
                    onChange={() => toggleSelection(order.id)}
                  />
                </td>
                <td className="px-4 py-2">{order.id}</td>
                <td className="px-4 py-2">{order.name}</td>
                <td className="px-4 py-2">{order.total}</td>
                <td className="px-4 py-2">
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-2">{order.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex gap-2 mt-6">
        {Array.from({length: totalPages}, (_, i) => (
          <Button
            key={i + 1}
            className={`rounded ${
              currentPage === i + 1 ? "bg-blue-600" : "bg-gray-400"
            }`}
            onClick={() => setCurrentPage(i + 1)}
          >
            {i + 1}
          </Button>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg max-w-sm w-full">
            <h4 className="text-lg font-semibold mb-4 text-gray-800">
              Confirm Status Update
            </h4>
            <p className="mb-4">
              Are you sure you want to mark selected orders as{" "}
              <span className="font-semibold">{nextStatus}</span>?
            </p>
            <div className="flex gap-4 justify-end">
              <Button onClick={confirmUpdate}>Confirm</Button>
              <Button
                onClick={() => setShowModal(false)}
                className="bg-gray-500"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
