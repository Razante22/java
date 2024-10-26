import { useState } from 'react';
import axios from 'axios';

export default function Home() {
    const [query, setQuery] = useState('');
    const [sort, setSort] = useState('relevance');
    const [products, setProducts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [error, setError] = useState('');

    const handleSearch = async (page = 1) => {
        try {
            const offset = (page - 1) * 10;
            const response = await axios.get(`/api/search`, {
                params: { query, sort, offset },
            });
            setProducts(response.data.products);
            setTotalPages(response.data.totalPages);
            setCurrentPage(page);
            setError('');
        } catch (error) {
            console.error('Erro ao buscar produtos:', error);
            setError('Erro ao buscar produtos. Tente novamente.');
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Impede o comportamento padrão
            handleSearch(); // Chama a função de busca
        }
    };

    return (
        <div className="container">
            <header>
                <h1>Buscador de Produtos do Mercado Livre</h1>
            </header>
            <form 
                onSubmit={(e) => { 
                    e.preventDefault(); 
                    handleSearch(); 
                }} 
                className="search-form"
            >
                <input
                    type="text"
                    placeholder="Digite o nome do produto"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyPress={handleKeyPress} // Adiciona o manipulador de tecla
                    className="search-input"
                />
                <select value={sort} onChange={(e) => setSort(e.target.value)} className="sort-select">
                    <option value="relevance">Mais Vendidos</option>
                    <option value="price_asc">Menor Preço</option>
                    <option value="price_desc">Maior Preço</option>
                </select>
                <button type="submit" className="search-button">Buscar</button>
            </form>

            {error && <div className="error">{error}</div>}

            <div className="results">
                <ul>
                    {products.map((product, index) => (
                        <li key={index} className="product">
                            <img src={product.image} alt={product.title} />
                            <div className="product-info">
                                <h3>{product.title}</h3>
                                <p className="product-price">R$ {product.price}</p>
                                <a href={product.link} target="_blank" rel="noopener noreferrer">
                                    Ver Produto
                                </a>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="pagination">
                {currentPage > 1 && (
                    <button onClick={() => handleSearch(currentPage - 1)}>
                        Página Anterior
                    </button>
                )}
                <span>Página {currentPage} de {totalPages}</span>
                {currentPage < totalPages && (
                    <button onClick={() => handleSearch(currentPage + 1)}>
                        Próxima Página
                    </button>
                )}
            </div>

            <style jsx>{`
                .container {
                    padding: 20px;
                }
                header {
                    text-align: center;
                    margin-bottom: 20px;
                }
                h1 {
                    color: #e0e0e0;
                    margin: 0;
                }
                .search-form {
                    display: flex;
                    flex-direction: column; /* Alinha elementos em coluna para dispositivos móveis */
                    gap: 10px;
                    margin: 20px 0;
                }
                .search-input, .sort-select, .search-button {
                    width: 100%; /* Faz os elementos ocuparem 100% da largura */
                    max-width: 300px; /* Limita a largura máxima */
                }
                .results {
                    margin-top: 20px;
                }
                .results ul {
                    display: flex;
                    flex-wrap: wrap;
                    justify-content: space-between;
                }
                .product {
                    background: rgba(255, 255, 255, 0.1);
                    border: 1px solid #333;
                    border-radius: 8px;
                    padding: 10px;
                    width: calc(19% - 15px); /* Ajusta a largura para caber 5 produtos em desktops */
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
                    transition: background 0.3s, box-shadow 0.3s, transform 0.2s;
                    margin-bottom: 20px;
                }
                .product img {
                    border-radius: 6px;
                    margin-bottom: 10px;
                    width: 100%;
                    height: 120px;
                    object-fit: cover;
                }
                .product-info {
                    text-align: center;
                    color: #e0e0e0;
                }
                .product-price {
                    font-weight: bold;
                    color: #00e5ff;
                    margin-top: 10px;
                }
                .pagination {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    margin: 20px 0;
                }
                .pagination span {
                    margin: 0 10px;
                    color: #e0e0e0;
                }

                /* Media Queries */
                @media (min-width: 601px) {
                    .search-form {
                        flex-direction: row; /* Alinha elementos em linha para desktops */
                    }
                    .search-input, .sort-select, .search-button {
                        width: auto; /* Remove o limite de 100% em desktops */
                    }
                }

                @media (max-width: 600px) {
                    .product {
                        width: calc(50% - 15px); /* 2 produtos em telas pequenas */
                    }
                }

                @media (max-width: 400px) {
                    .product {
                        width: 100%; /* 1 produto por linha em telas muito pequenas */
                    }
                }
            `}</style>
        </div>
    );
}
