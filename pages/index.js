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
        </div>
    );
}
