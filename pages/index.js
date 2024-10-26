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
                <MobileSearch />
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
                        /* Coloque aqui o restante do CSS para desktop conforme necessário */
                    `}</style>
                </div>
            )}
        </div>
    );
}
