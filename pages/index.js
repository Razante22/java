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
    const [maxAge, setMaxAge] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    const checkMobile = () => {
        setIsMobile(window.innerWidth <= 768);
    };

    const handleSearch = async (page = 1) => {
        setIsLoading(true);
        try {
            let categoryDescription = '';
            switch (sort) {
                case 'relevance':
                    categoryDescription = 'mais vendidos';
                    break;
                case 'sold_asc':
                    categoryDescription = 'menos vendidos';
                    break;
                case 'price_asc':
                    categoryDescription = 'menor preço';
                    break;
                case 'price_desc':
                    categoryDescription = 'maior preço';
                    break;
                default:
                    categoryDescription = 'relevância';
            }

            const deepseekResponse = await axios.post(
                'https://api.deepseek.com/v1/chat/completions',
                {
                    model: 'deepseek-chat',
                    messages: [
                        {
                            role: 'user',
                            content: `Refine a pesquisa "${query}" para encontrar produtos no Mercado Livre, priorizando ${categoryDescription}. Retorne apenas termos de busca melhorados.`,
                        },
                    ],
                },
                {
                    headers: {
                        'Authorization': `Bearer sk-8bbfaf34376f41ddb69ddc357dbb7aaa`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            const refinedQuery = deepseekResponse.data.choices?.[0]?.message?.content?.trim();
            if (!refinedQuery) throw new Error('Falha ao refinar a pesquisa.');

            const offset = (page - 1) * 10;
            const mercadoLivreResponse = await axios.get('/api/search', {
                params: {
                    query: refinedQuery,
                    sort,
                    offset,
                    maxAge,
                },
            });

            setProducts(mercadoLivreResponse.data.products);
            setTotalPages(mercadoLivreResponse.data.totalPages);
            setCurrentPage(page);
            setError('');
        } catch (error) {
            console.error('Erro ao buscar produtos:', error);
            setError('Erro ao buscar produtos. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    return (
        <div className="container">
            <header>
                <h1>Buscador de Produtos do Mercado Livre</h1>
            </header>
            <style jsx>{
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
                    margin-bottom: 10px;
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
                    width: 200px;
                    height: 200px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    background: #f0f0f0;
                    border-radius: 8px;
                    margin-right: 10px;
                }
                .product-image {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    border-radius: 8px;
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
            }</style>
        </div>
    );
}
