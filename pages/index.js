import { useState, useEffect } from 'react';
import axios from 'axios';
import Slider from 'react-slick';
import MobileSearch from './MobileSearch';

export default function Home() {
    const [query, setQuery] = useState('');
    const [sort, setSort] = useState('relevance');
    const [products, setProducts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [error, setError] = useState('');
    const [isMobile, setIsMobile] = useState(false);

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

    const sliderSettings = {
        dots: true,
        infinite: false,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
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
                    {products.map((product, index) => (
                        <li key={index} className="product">
                            <Slider {...sliderSettings}>
                                {product.images.map((image, i) => (
                                    <div key={i}>
                                        <img src={image} alt={`${product.title} imagem ${i+1}`} />
                                    </div>
                                ))}
                            </Slider>
                            <div className="product-info">
                                <h3>{product.title}</h3>
                                <p>{product.soldText}</p> {/* Mostra a quantidade de vendidos */}
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
                /* Seu estilo */
            `}</style>
        </div>
    );
}
