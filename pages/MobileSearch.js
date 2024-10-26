import { useState } from 'react';
import axios from 'axios';

export default function MobileSearch({ handleSearch, query, setQuery, sort, setSort }) {
    const [error, setError] = useState('');

    const onKeyPress = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault(); // Previne a ação padrão do Enter
            handleSearch(); // Chama a função de busca
        }
    };

    return (
        <div className="mobile-search">
            <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }}>
                <input
                    type="text"
                    placeholder="Digite o nome do produto"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyPress={onKeyPress} // Adiciona o evento de tecla
                />
                <select value={sort} onChange={(e) => setSort(e.target.value)}>
                    <option value="relevance">Mais Vendidos</option>
                    <option value="price_asc">Menor Preço</option>
                    <option value="price_desc">Maior Preço</option>
                </select>
                <button type="submit">Buscar</button>
            </form>

            {error && <div className="error">{error}</div>}

            <style jsx>{`
                .mobile-search {
                    padding: 20px;
                }
                form {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }
                input {
                    width: 100%;
                    padding: 10px;
                    border-radius: 5px;
                    border: 1px solid #ccc;
                }
                select {
                    padding: 10px;
                    border-radius: 5px;
                    border: 1px solid #ccc;
                }
                button {
                    padding: 10px;
                    border-radius: 5px;
                    background-color: #0070f3;
                    color: white;
                    border: none;
                    cursor: pointer;
                }
                button:hover {
                    background-color: #005bb5;
                }
            `}</style>
        </div>
    );
}
