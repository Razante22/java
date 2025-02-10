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
    const [maxAge, setMaxAge] = useState(0); // Novo estado para filtro de tempo

    const checkMobile = () => {
        setIsMobile(window.innerWidth <= 768);
    };

    const handleSearch = async (page = 1) => {
        try {
            const offset = (page - 1) * 10;
            const response = await axios.get('/api/search', {
                params: { 
                    query, 
                    sort, 
                    offset,
                    maxAge // Adicionando o novo parâmetro
                },
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

    useEffect(() => {
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Função para calcular dias desde a criação
    const daysSinceCreation = (dateString) => {
        const createdDate = new Date(dateString);
        const today = new Date();
        return Math.floor((today - createdDate) / (1000 * 60 * 60 * 24));
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
                    maxAge={maxAge}
                    setMaxAge={setMaxAge}
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
                            <option value="sold_asc">Menos Vendidos</option>
                            <option value="price_asc">Menor Preço</option>
                            <option value="price_desc">Maior Preço</option>
                        </select>
                        <div className="age-filter">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={maxAge === 60}
                                    onChange={(e) => setMaxAge(e.target.checked ? 60 : 0)}
                                />
                                Menos de 60 dias
                            </label>
                        </div>
                        <button type="submit">Buscar</button>
                    </form>
                </div>
            )}

            {error && <div className="error">{error}</div>}

            <div className="results">
                <ul>
                    {products
                        .filter(product => daysSinceCreation(product.dateCreated) < maxAge || maxAge === 0)
                        .map((product, index) => (
                            <li key={index} className="product">
                                <div className="image-carousel">
                                    <button className="carousel-button left" onClick={() => {
                                        const carousel = document.querySelector(`#carousel-${index}`);
                                        carousel.scrollLeft -= carousel.offsetWidth;
                                    }}>
                                        &lt;
                                    </button>
                                    <div className="image-wrapper" id={`carousel-${index}`}>
                                        {product.images.map((img, idx) => (
                                            <div className="image-container" key={idx}>
                                                <img 
                                                    src={img} 
                                                    alt={`Imagem ${idx + 1} de ${product.title}`} 
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    <button className="carousel-button right" onClick={() => {
                                        const carousel = document.querySelector(`#carousel-${index}`);
                                        carousel.scrollLeft += carousel.offsetWidth;
                                    }}>
                                        &gt;
                                    </button>
                                </div>
                                <div className="product-info">
                                    <h3>{product.title}</h3>
                                    <p className="product-price">R$ {product.price}</p>
                                    <p>Quantidade Vendida: {product.soldQuantity}</p>
                                    <p>Criado em: {product.dateCreated}</p> {/* Data de criação mantida */}
                                    <p>Última Atualização: {product.lastUpdated}</p>
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
                .desktop-search {
                    margin-bottom: 20px;
                }
                .desktop-search form {
                    display: flex;
                    gap: 10px;
                    align-items: center;
                    justify-content: center;
                }
                .desktop-search input {
                    padding: 8px;
                    border-radius: 4px;
                    border: 1px solid #555;
                    background: #333;
                    color: white;
                }
                .desktop-search select {
                    padding: 8px;
                    border-radius: 4px;
                    background: #333;
                    color: white;
                    border: 1px solid #555;
                }
                .desktop-search button {
                    padding: 8px 16px;
                    border-radius: 4px;
                    background: #00e5ff;
                    color: black;
                    border: none;
                    cursor: pointer;
                }
                .age-filter {
                    margin: 10px 0;
                    color: #e0e0e0;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .age-filter input {
                    margin-right: 5px;
                }
                .results {
                    margin-top: 20px;
                }
                .results ul {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 10px;
                    justify-content: center;
                }
                .product {
                    background: rgba(255, 255, 255, 0.1);
                    border: 1px solid #333;
                    border-radius: 8px;
                    padding: 15px;
                    width: 220px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
                }
                .image-carousel {
                    position: relative;
                    width: 100%;
                    overflow: hidden;
                }
                .image-wrapper {
                    display: flex;
                    overflow-x: auto;
                    scroll-behavior: smooth;
                    scrollbar-width: none;
                }
                .image-wrapper::-webkit-scrollbar {
                    display: none;
                }
                .image-container {
                    flex: 0 0 auto;
                    width: 100%;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }
                .image-container img {
                    width: 100%;
                    height: auto;
                    border-radius: 6px;
                }
                .carousel-button {
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                    background: rgba(255, 255, 255, 0.5);
                    border: none;
                    cursor: pointer;
                    font-size: 20px;
                    color: #333;
                    z-index: 10;
                    padding: 10px;
                    border-radius: 50%;
                }
                .carousel-button.left {
                    left: 10px;
                }
                .carousel-button.right {
                    right: 10px;
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
                .pagination button {
                    padding: 8px 16px;
                    border-radius: 4px;
                    background: #00e5ff;
                    color: black;
                    border: none;
                    cursor: pointer;
                }
            `}</style>
        </div>
    );
}
