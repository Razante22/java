import { useState } from 'react';

const MobileSearch = ({ handleSearch, query, setQuery, sort, setSort }) => {
    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault(); // Previne a ação padrão
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
                    onKeyPress={handleKeyPress} // Adiciona o listener de tecla
                />
                <select value={sort} onChange={(e) => setSort(e.target.value)}>
                    <option value="relevance">Mais Vendidos</option>
                    <option value="price_asc">Menor Preço</option>
                    <option value="price_desc">Maior Preço</option>
                </select>
                <button type="submit">Buscar</button>
            </form>

            <style jsx>{`
                .mobile-search {
                    display: flex;
                    flex-direction: column; /* Coloca os elementos em coluna */
                    margin-bottom: 20px; /* Margem inferior para espaçamento */
                }
                input {
                    margin-bottom: 10px; /* Espaço abaixo do input */
                    padding: 10px; /* Aumenta a área clicável */
                    border: 1px solid #ccc; /* Estilo do input */
                    border-radius: 4px; /* Cantos arredondados */
                }
                select {
                    margin-bottom: 10px; /* Espaço abaixo do select */
                    padding: 10px; /* Aumenta a área clicável */
                    border: 1px solid #ccc; /* Estilo do select */
                    border-radius: 4px; /* Cantos arredondados */
                }
                button {
                    padding: 10px; /* Estilo do botão */
                    background-color: #0070f3; /* Cor do botão */
                    color: white; /* Cor do texto do botão */
                    border: none; /* Remove a borda padrão */
                    border-radius: 4px; /* Cantos arredondados */
                    cursor: pointer; /* Cursor de ponteiro ao passar sobre o botão */
                }
            `}</style>
        </div>
    );
};

export default MobileSearch;
