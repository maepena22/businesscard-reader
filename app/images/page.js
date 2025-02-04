'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Images() {
    const [businessCards, setBusinessCards] = useState([]);

    useEffect(() => {
        fetch('/api/business-cards')
            .then(res => res.json())
            .then(data => setBusinessCards(data));
    }, []);

    return (
        <div className="container mx-auto p-4 bg-white">
            <h1 className="text-3xl font-bold mb-4 text-gray-900">Business Cards Database</h1>
            <Link href="/" className="text-red-500 hover:text-red-700 mb-6 inline-block">
                ← Back to Upload
            </Link>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {businessCards.map((card, index) => (
                    <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-100">
                        <div className="relative h-48 bg-gray-50">
                            <img 
                                src={`/uploads/${card.image_path}`} 
                                alt={card.name} 
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="p-6">
                            <h3 className="text-2xl font-bold mb-3 text-gray-900">{card.name}</h3>
                            
                            {card.organization && (
                                <div className="mb-3">
                                    <span className="text-red-500 font-semibold">Organization</span>
                                    <p className="text-gray-800 mt-1">{card.organization}</p>
                                </div>
                            )}
                            
                            {card.department && (
                                <div className="mb-3">
                                    <span className="text-red-500 font-semibold">Department</span>
                                    <p className="text-gray-800 mt-1">{card.department}</p>
                                </div>
                            )}

                            <div className="border-t border-gray-100 my-4 pt-4">
                                <h4 className="text-red-500 font-semibold mb-2">Contact Information</h4>
                                {card.telephone && (
                                    <p className="text-gray-800 mb-2">
                                        <span className="font-semibold text-gray-900">Tel:</span> {card.telephone}
                                    </p>
                                )}
                                {card.fax && (
                                    <p className="text-gray-800 mb-2">
                                        <span className="font-semibold text-gray-900">Fax:</span> {card.fax}
                                    </p>
                                )}
                                {card.email && (
                                    <p className="text-gray-800 mb-2">
                                        <span className="font-semibold text-gray-900">Email:</span>{' '}
                                        <a href={`mailto:${card.email}`} className="text-red-500 hover:text-red-700">
                                            {card.email}
                                        </a>
                                    </p>
                                )}
                                {card.website && (
                                    <p className="text-gray-800 mb-2">
                                        <span className="font-semibold text-gray-900">Website:</span>{' '}
                                        <a href={card.website} target="_blank" rel="noopener noreferrer" 
                                           className="text-red-500 hover:text-red-700">
                                            {card.website}
                                        </a>
                                    </p>
                                )}
                            </div>

                            {card.address && (
                                <div className="border-t border-gray-100 mt-4 pt-4">
                                    <span className="text-red-500 font-semibold">Address</span>
                                    <p className="text-gray-800 mt-1">{card.address}</p>
                                </div>
                            )}

                            <div className="text-sm text-gray-500 mt-4">
                                Added: {new Date(card.created_at).toLocaleDateString()}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}