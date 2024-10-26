import { useState } from 'react';

const MobileSearch = ({ handleSearch, query, setQuery, sort, setSort }) => {
    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault(); // Previne a ação padrão de 'Enter' que causa o foco em um elemento abaixo
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
                    onKeyPress={handleKeyPress} // Adiciona o listener de teclado
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
                    justify-content: space-between; /* Espaçamento entre input e select */
                    align-items: center; /* Alinha itens no centro verticalmente */
                    margin-bottom: 20px; /* Margem inferior para espaçamento */
                }
                input {
                    flex: 1; /* Ocupa o máximo de espaço disponível */
                    margin-right: 10px; /* Espaço entre input e select */
                }
                select {
                    margin-right: 10px; /* Espaço entre select e botão */
                }
            `}</style>
        </div>
    );
};

export default MobileSearch;
