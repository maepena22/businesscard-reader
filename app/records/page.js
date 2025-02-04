'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Records() {
    const [businessCards, setBusinessCards] = useState([]);
    const [selectedCards, setSelectedCards] = useState([]);
    const [selectAll, setSelectAll] = useState(false);

    useEffect(() => {
        fetch('/api/business-cards')
            .then(res => res.json())
            .then(data => setBusinessCards(data));
    }, []);

    const handleSelectAll = (e) => {
        setSelectAll(e.target.checked);
        setSelectedCards(e.target.checked ? businessCards.map(card => card.id) : []);
    };

    const handleSelectCard = (id) => {
        setSelectedCards(prev => 
            prev.includes(id) 
                ? prev.filter(cardId => cardId !== id)
                : [...prev, id]
        );
    };

    const handleExport = async () => {
        if (selectedCards.length === 0) {
            alert('Please select at least one record to export');
            return;
        }

        const response = await fetch('/api/export-cards', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ cardIds: selectedCards }),
        });

        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'selected_business_cards.xlsx';
            document.body.appendChild(a);
            a.click();
            a.remove();
        }
    };

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Business Card Records</h1>
                <div className="space-x-4">
                    <Link href="/" className="text-red-500 hover:text-red-700">
                        ← Back to Upload
                    </Link>
                    <button
                        onClick={handleExport}
                        disabled={selectedCards.length === 0}
                        className="bg-red-500 text-white px-4 py-2 rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                        Export Selected
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="p-3 border">
                                <input
                                    type="checkbox"
                                    checked={selectAll}
                                    onChange={handleSelectAll}
                                    className="rounded border-gray-300"
                                />
                            </th>
                            <th className="p-3 border">Image</th>
                            <th className="p-3 border">Name</th>
                            <th className="p-3 border">Organization</th>
                            <th className="p-3 border">Department</th>
                            <th className="p-3 border">Contact</th>
                            <th className="p-3 border">Address</th>
                        </tr>
                    </thead>
                    <tbody>
                        {businessCards.map((card) => (
                            <tr key={card.id} className="hover:bg-gray-50">
                                <td className="p-3 border">
                                    <input
                                        type="checkbox"
                                        checked={selectedCards.includes(card.id)}
                                        onChange={() => handleSelectCard(card.id)}
                                        className="rounded border-gray-300"
                                    />
                                </td>
                                <td className="p-3 border">
                                    <img
                                        src={`/uploads/${card.image_path}`}
                                        alt={card.name}
                                        className="w-32 h-20 object-cover"
                                    />
                                </td>
                                <td className="p-3 border">{card.name}</td>
                                <td className="p-3 border">{card.organization}</td>
                                <td className="p-3 border">{card.department}</td>
                                <td className="p-3 border">
                                    {card.telephone && <div>Tel: {card.telephone}</div>}
                                    {card.fax && <div>Fax: {card.fax}</div>}
                                    {card.email && (
                                        <div>
                                            <a href={`mailto:${card.email}`} className="text-red-500 hover:text-red-700">
                                                {card.email}
                                            </a>
                                        </div>
                                    )}
                                    {card.website && (
                                        <div>
                                            <a href={card.website} target="_blank" rel="noopener noreferrer" 
                                               className="text-red-500 hover:text-red-700">
                                                Website
                                            </a>
                                        </div>
                                    )}
                                </td>
                                <td className="p-3 border">{card.address}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}