import { useState, useEffect } from 'react';
import axios from 'axios';
import MobileSearch from './MobileSearch';

export default function Home() {
    const [query, setQuery] = useState('');
    const [sort, setSort] = useState('relevance');
    const [products, setProducts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [error, setError] = useState('');
    const [isMobile, setIsMobile] = useState(false);
    const [currentImageIndexes, setCurrentImageIndexes] = useState({});

    const checkMobile = () => {
        setIsMobile(window.innerWidth <= 768);
    };

    const handleSearch = async (page = 1) => {
        try {
            const offset = (page - 1) * 10;
            const response = await axios.get('/api/search', {
                params: { query, sort, offset },
            });
            setProducts(response.data.products);
            setTotalPages(response.data.totalPages);
            setCurrentPage(page);
            setError('');
            setCurrentImageIndexes({});
        } catch (error) {
            console.error('Erro ao buscar produtos:', error);
            setError('Erro ao buscar produtos. Tente novamente.');
        }
    };

    useEffect(() => {
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const handleNextImage = (index) => {
        setCurrentImageIndexes((prev) => ({
            ...prev,
            [index]: (prev[index] || 0) + 1,
        }));
    };

    const handlePrevImage = (index) => {
        setCurrentImageIndexes((prev) => ({
            ...prev,
            [index]: (prev[index] || 0) - 1 < 0 ? products[index].images.length - 1 : prev[index] - 1,
        }));
    };

    return (
        <div className="container">
            <header>
                <h1>Buscador de Produtos do Mercado Livre</h1>
            </header>

            {isMobile ? (
                <MobileSearch 
                    handleSearch={handleSearch} 
                    query={query} 
                    setQuery={setQuery} 
                    sort={sort} 
                    setSort={setSort} 
                />
            ) : (
                <div className="desktop-search">
                    <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }}>
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
                </div>
            )}

            {error && <div className="error">{error}</div>}

            <div className="results">
                <ul>
                    {products.map((product, index) => {
                        const currentIndex = currentImageIndexes[index] || 0;
                        return (
                            <li key={index} className="product">
                                <div className="image-carousel">
                                    <button className="carousel-button left" onClick={() => handlePrevImage(index)}>&lt;</button>
                                    <img src={product.images[currentIndex]} alt={`Imagem de ${product.title}`} />
                                    <button className="carousel-button right" onClick={() => handleNextImage(index)}>&gt;</button>
                                </div>
                                <div className="product-info">
                                    <h3>{product.title}</h3>
                                    <p className="product-price">R$ {product.price}</p>
                                    <p>{product.subtitle}</p>
                                    <p>Quantidade Vendida: {product.soldText}</p>
                                    <p>Criado em: {product.dateCreated}</p>
                                    <p>Última Atualização: {product.lastUpdated}</p>
                                    <a href={product.link} target="_blank" rel="noopener noreferrer">
                                        Ver Produto
                                    </a>
                                </div>
                            </li>
                        );
                    })}
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
                    max-width: 1200px; /* Adiciona limite de largura ao contêiner */
                    margin: 0 auto; /* Centraliza o contêiner */
                }
                header {
                    text-align: center;
                    margin-bottom: 20px;
                }
                h1 {
                    color: #e0e0e0;
                    margin: 0;
                }
                .desktop-search {
                    margin-bottom: 20px;
                }
                .results {
                    margin-top: 20px;
                }
                .results ul {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 30px; /* Aumenta o espaço entre os produtos */
                    justify-content: center;
                }
                .product {
                    background: rgba(255, 255, 255, 0.1);
                    border: 1px solid #333;
                    border-radius: 8px;
                    padding: 15px;
                    width: 250px; /* Aumenta a largura dos produtos */
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
                    transition: background 0.3s, box-shadow 0.3s, transform 0.2s;
                }
                .image-carousel {
                    display: flex;
                    align-items: center;
                    width: 100%;
                }
                .carousel-button {
                    background: none;
                    border: none;
                    color: #e0e0e0;
                    font-size: 16px;
                    padding: 2px 6px;
                    cursor: pointer;
                }
                .carousel-button:hover {
                    color: #00e5ff;
                }
                .image-carousel img {
                    width: 100%;
                    height: 150px; /* Ajuste a altura das imagens */
                    border-radius: 6px;
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
    );
}
