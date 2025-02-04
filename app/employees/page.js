'use client';
import { useState, useEffect } from 'react';

export default function Employees() {
    const [employees, setEmployees] = useState([]);
    const [newEmployee, setNewEmployee] = useState('');

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        const response = await fetch('/api/employees');
        const data = await response.json();
        setEmployees(data);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newEmployee.trim()) return;

        await fetch('/api/employees', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: newEmployee }),
        });

        setNewEmployee('');
        fetchEmployees();
    };

    const handleDelete = async (id) => {
        await fetch(`/api/employees/${id}`, { method: 'DELETE' });
        fetchEmployees();
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-6 text-gray-900">Manage Employees</h1>
            
            <form onSubmit={handleSubmit} className="mb-8">
                <div className="flex gap-4">
                    <input
                        type="text"
                        value={newEmployee}
                        onChange={(e) => setNewEmployee(e.target.value)}
                        placeholder="Enter employee name"
                        className="flex-1 p-2 border border-gray-300 rounded"
                    />
                    <button
                        type="submit"
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                    >
                        Add Employee
                    </button>
                </div>
            </form>

            <div className="bg-white rounded-lg shadow">
                <table className="min-w-full">
                    <thead>
                        <tr className="bg-gray-50">
                            <th className="px-6 py-3 text-left text-gray-700">Name</th>
                            <th className="px-6 py-3 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {employees.map((employee) => (
                            <tr key={employee.id} className="border-t">
                                <td className="px-6 py-4">{employee.name}</td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => handleDelete(employee.id)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}