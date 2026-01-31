import React, { useState } from "react";
import useAuth from "./../../../hooks/useAuth";
import { useEffect } from "react";
import { Table } from "react-bootstrap";
import { useForm } from "react-hook-form";
import API_BASE_URL from "../../../config/api";

const MyOrder = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);

  const { handleSubmit } = useForm();
  const onSubmit = (data) => {
    console.log(data);
  };
  useEffect(() => {
    if (user?.email) {
      fetch(`${API_BASE_URL}/orders/${user.email}`)
        .then((res) => res.json())
        .then((data) => setOrders(data))
        .catch((error) => console.error("Error fetching orders:", error));
    }
  }, [user?.email]);

  const handleDeleteOrder = (id) => {
    const proceed = window.confirm("Are you sure,you want to delete?");
    if (proceed) {
      const url = `${API_BASE_URL}/orders/${id}`;
      fetch(url, {
        method: "DELETE",
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.deletedCount) {
            alert("deleted successfully");
            const remainingUsers = orders.filter((user) => user._id !== id);
            setOrders(remainingUsers);
          }
        });
    }
  };
  return (
    <div className="container">
      <h1 className="text-primary text-center">My Order {orders?.length}</h1>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>#</th>
            <th>Product Name</th>
            <th>Phone</th>
            <th>Address</th>
            <th>Action</th>
          </tr>
        </thead>
        {orders?.map((last, index) => (
          <tbody>
            <tr>
              <td>{index}</td>
              <td>{last?.product}</td>
              <td>{last?.phone}</td>
              <td>{last?.address}</td>
              <td>
                <form onSubmit={handleSubmit(onSubmit)}>
                  <select>
                    <option value={last?.status}>{last?.status}</option>
                    <option value="approve">approve</option>
                    <option value="done">Done</option>
                  </select>
                  <input type="submit" />
                </form>
              </td>
              <button className="bg-success p-2">Update</button>
              <button
                onClick={() => handleDeleteOrder(last._id)}
                className="bg-danger p-2"
              >
                Delete
              </button>
            </tr>
          </tbody>
        ))}
      </Table>
    </div>
  );
};

export default MyOrder;
