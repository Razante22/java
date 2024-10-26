import { useState, useEffect } from 'react';
import axios from 'axios';
import dynamic from 'next/dynamic';

const MobileSearch = dynamic(() => import('./MobileSearch'), { ssr: false });

export default function Home() {
    const [isMobile, setIsMobile] = useState(false);
    const [query, setQuery] = useState('');
    const [sort, setSort] = useState('relevance');
    const [products, setProducts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [error, setError] = useState('');

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 600);
        };

        window.addEventListener('resize', handleResize);
        handleResize(); // Chama a função ao montar o componente

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

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

    return (
        <div className="container">
            <header>
                <h1>Buscador de Produtos do Mercado Livre</h1>
            </header>

            {isMobile ? (
                <MobileSearch handleSearch={handleSearch} query={query} setQuery={setQuery} sort={sort} setSort={setSort} />
            ) : (
                <div className="desktop-search">
                    <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="search-form">
                        <input
                            type="text"
                            placeholder="Digite o nome do produto"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                        <select value={sort} onChange={(e) => setSort(e.target.value)}>
                            <option value="relevance">Mais Vendidos</option>
                            <option value="price_asc">Menor Preço</option>
                            <option value="price_desc">Maior Preço</option>
                        </select>
                        <button type="submit">Buscar</button>
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
                        .desktop-search {
                            padding: 20px;
                        }
                        .results {
                            margin-top: 20px;
                        }
                        .results ul {
                            display: flex;
                            flex-wrap: wrap;
                            justify-content: space-between; /* Ajuste para espaçar produtos */
                        }
                        .product {
                            background: rgba(255, 255, 255, 0.1);
                            border: 1px solid #333;
                            border-radius: 8px;
                            padding: 10px;
                            width: calc(19% - 10px); /* 5 produtos por linha com margem */
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
                            height: 180px;
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
                    `}</style>
                </div>
            )}
        </div>
    );
}
