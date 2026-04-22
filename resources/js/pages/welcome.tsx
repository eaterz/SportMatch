import React, { useState, useEffect } from 'react';

type FooterContentKey = keyof typeof import('@/data/footerContent').footerContent;
import { Users, Trophy, Calendar, MapPin, Star, ChevronRight, Search } from 'lucide-react';
import FooterModal from '@/components/FooterModal';
import { footerContent } from '@/data/footerContent';

export default function Welcome() {
    const [isVisible, setIsVisible] = useState(false);
    const [currentImage, setCurrentImage] = useState(0);
    const [modalState, setModalState] = useState({
        isOpen: false,
        title: '',
        content: ''
    });

    const auth = { user: null };

    const redirectToLogin = () => {
        window.location.href = '/login';
    };

    const redirectToRegister = () => {
        window.location.href = '/register';
    };

    const redirectToProfile = () => {
        window.location.href = '/dashboard';
    };

    const openModal = (contentKey: FooterContentKey) => {
        const content = footerContent[contentKey];
        if (content) {
            setModalState({
                isOpen: true,
                title: content.title,
                content: content.content
            });
        }
    };

    const closeModal = () => {
        setModalState({
            isOpen: false,
            title: '',
            content: ''
        });
    };

    const sportImages = [
        {
            src: "https://img.freepik.com/premium-photo/playful-friends-group-young-smiling-people-casual-wear-playing-soccer-while-standing-outdoors_425904-11714.jpg",
            alt: "Futbola spēle",
            sport: "Futbols"
        },
        {
            src: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&h=600&fit=crop",
            alt: "Basketbola spēle",
            sport: "Basketbols"
        },
        {
            src: "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=800&h=600&fit=crop",
            alt: "Tenisa spēle",
            sport: "Teniss"
        },
        {
            src: "https://res.cloudinary.com/simpleview/image/upload/v1481922813/clients/surfcityusa-redesign/Volleyball_1_0df826c7-1cc7-4334-be80-078425e9069c.jpg",
            alt: "Volejbols",
            sport: "Volejbols"
        }
    ];

    const features = [
        {
            icon: Users,
            title: "Atrodi Sporta Partnerus",
            description: "Savieno ar cilvēkiem, kas dalās tavās sporta interesēs un vēlas trenēties kopā",
            image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop"
        },
        {
            icon: Trophy,
            title: "Pievieno Sporta Grupām",
            description: "Atklāj vietējos sporta klubus, komandas un regulārus treniņu grupas",
            image: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=400&h=300&fit=crop"
        },
        {
            icon: Calendar,
            title: "Organizē Spēles",
            description: "Izveido sporta pasākumus, turnīrus un ielūdz citus dalībniekus",
            image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&h=300&fit=crop"
        },
        {
            icon: MapPin,
            title: "Vietējie Pasākumi",
            description: "Atrodi sporta aktivitātes un treniņus savā pilsētā vai rajonā",
            image: "https://www.riddlevillage.com/wp-content/uploads/sports-for-seniors.jpg"
        }
    ];

    const testimonials = [
        {
            name: "Mārtiņš K.",
            text: "Atklāju fantastisku basketbola komandu! Tagad spēlēju katru nedēļu un esmu ieguvis jaunus draugus.",
            sport: "Basketbols",
            rating: 5,
            image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
        },
        {
            name: "Laura S.",
            text: "Beidzot atradu skrējiena partneri! Motivācija ir divreiz lielāka, kad ir ar ko dalīties.",
            sport: "Skrējiens",
            rating: 5,
            image: "https://hips.hearstapps.com/hmg-prod/images/single-women-happier-than-men-675ac891b545d.jpg?crop=0.670xw:1.00xh;0.247xw,0&resize=640:*"
        },
        {
            name: "Andris P.",
            text: "Lieliski organizēti tenisa turnīri. Platforma palīdzēja atrast partneri manā līmenī.",
            sport: "Teniss",
            rating: 5,
            image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
        }
    ];

    useEffect(() => {
        setIsVisible(true);
        const interval = setInterval(() => {
            setCurrentImage((prev) => (prev + 1) % sportImages.length);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-50 backdrop-blur-md bg-white/95">
                <nav className="flex items-center justify-between max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-gray-800 to-black rounded-xl flex items-center justify-center shadow-sm">
                            <Trophy className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            SportMatch
                        </h1>
                    </div>

                    <div className="flex items-center space-x-3">
                        {auth.user ? (
                            <button
                                onClick={redirectToProfile}
                                className="px-5 py-2.5 bg-black hover:bg-gray-800 text-white rounded-xl font-semibold text-sm transition-all duration-300"
                            >
                                Profils
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={redirectToLogin}
                                    className="hidden sm:block px-5 py-2.5 text-gray-700 hover:text-black font-medium text-sm transition-all duration-300"
                                >
                                    Pieslēgties
                                </button>
                                <button
                                    onClick={redirectToRegister}
                                    className="px-5 py-2.5 bg-black hover:bg-gray-800 text-white rounded-xl font-semibold text-sm transition-all duration-300"
                                >
                                    Sākt
                                </button>
                            </>
                        )}
                    </div>
                </nav>
            </header>

            {/* Hero Section */}
            <section className="bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-28">
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                        <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 transform translate-x-0' : 'opacity-0 transform -translate-x-8'}`}>
                            <div className="inline-flex items-center px-4 py-2 bg-gray-100 rounded-full mb-6">
                                <span className="text-sm font-semibold text-gray-700">Latvijas #1 Sporta Platforma</span>
                            </div>
                            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900 mb-6 leading-tight">
                                Atrodi Savu
                                <br />
                                <span className="bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">Sporta Partneri</span>
                            </h1>
                            <p className="text-xl text-gray-600 mb-10 leading-relaxed max-w-xl">
                                Platforma, kas apvieno sporta entuziastus. Atrodi partnerus, izveido grupas un organizē spēles.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 mb-12">
                                <button
                                    onClick={redirectToRegister}
                                    className="group px-8 py-4 bg-black hover:bg-gray-800 text-white rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center space-x-2"
                                >
                                    <span>Sākt Meklēt</span>
                                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </button>
                                <button
                                    onClick={redirectToLogin}
                                    className="px-8 py-4 border-2 border-gray-300 hover:border-gray-900 text-gray-700 hover:text-gray-900 rounded-xl font-bold text-lg transition-all duration-300"
                                >
                                    Pieslēgties
                                </button>
                            </div>

                            <div className="grid grid-cols-3 gap-6">
                                <div>
                                    <div className="text-4xl font-bold text-gray-900 mb-1">1,250+</div>
                                    <div className="text-sm text-gray-600">Lietotāji</div>
                                </div>
                                <div>
                                    <div className="text-4xl font-bold text-gray-900 mb-1">450+</div>
                                    <div className="text-sm text-gray-600">Grupas</div>
                                </div>
                                <div>
                                    <div className="text-4xl font-bold text-gray-900 mb-1">15+</div>
                                    <div className="text-sm text-gray-600">Sporta Veidi</div>
                                </div>
                            </div>
                        </div>

                        <div className={`transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 transform translate-x-0' : 'opacity-0 transform translate-x-8'}`}>
                            <div className="relative">
                                <div className="relative w-full h-96 lg:h-[550px] rounded-3xl overflow-hidden shadow-2xl">
                                    {sportImages.map((image, index) => (
                                        <div
                                            key={index}
                                            className={`absolute inset-0 transition-all duration-1000 ${
                                                index === currentImage ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
                                            }`}
                                        >
                                            <img
                                                src={image.src}
                                                alt={image.alt}
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                                            <div className="absolute bottom-8 left-8">
                                                <h3 className="text-3xl font-bold text-white mb-2">{image.sport}</h3>
                                                <p className="text-white/90">Atrodi partnerus šodien</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex justify-center space-x-2 mt-6">
                                    {sportImages.map((_, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setCurrentImage(index)}
                                            className={`h-2 rounded-full transition-all duration-300 ${
                                                index === currentImage ? 'bg-gray-900 w-8' : 'bg-gray-300 w-2 hover:bg-gray-400'
                                            }`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">Kāpēc Izvēlēties SportMatch?</h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Vienkārša un efektīva platforma sporta entuziastiem
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="group bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-500"
                            >
                                <div className="relative h-48 overflow-hidden">
                                    <img
                                        src={feature.image}
                                        alt={feature.title}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                    <div className="absolute top-4 left-4 w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
                                        <feature.icon className="w-6 h-6 text-gray-900" />
                                    </div>
                                </div>
                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                                    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Hero Image Section */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="relative h-96 lg:h-[500px] rounded-3xl overflow-hidden shadow-2xl">
                        <img
                            src="https://cdn.shopify.com/s/files/1/0521/0996/7560/files/shutterstock_1779681110_1024x1024.jpg?v=1617987950"
                            alt="Sporta komanda"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50"></div>
                        <div className="absolute inset-0 flex items-center justify-center text-center p-6">
                            <div className="max-w-3xl">
                                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
                                    Iepazīsties Caur Sportu
                                </h2>
                                <p className="text-xl text-white/90 mb-8">
                                    Vairāk nekā 1000 sporta entuziasti jau ir atraduši savus partnerus
                                </p>
                                <button
                                    onClick={redirectToRegister}
                                    className="px-10 py-4 bg-white text-gray-900 hover:bg-gray-100 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105"
                                >
                                    Pievienoties Tagad
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-4xl lg:text-5xl font-bold text-center text-gray-900 mb-16">Lietotāju Atsauksmes</h2>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {testimonials.map((testimonial, index) => (
                            <div key={index} className="bg-white rounded-2xl p-8 hover:shadow-xl transition-all duration-300">
                                <div className="flex items-center mb-4">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <Star key={i} className="w-5 h-5 text-gray-900 fill-current" />
                                    ))}
                                </div>
                                <p className="text-gray-700 mb-6 leading-relaxed italic text-lg">
                                    "{testimonial.text}"
                                </p>
                                <div className="flex items-center space-x-4">
                                    <img
                                        src={testimonial.image}
                                        alt={testimonial.name}
                                        className="w-14 h-14 rounded-full object-cover"
                                    />
                                    <div>
                                        <div className="font-bold text-gray-900">{testimonial.name}</div>
                                        <div className="text-sm text-gray-600">{testimonial.sport}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Popular Sports Grid */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-4xl lg:text-5xl font-bold text-center text-gray-900 mb-4">Populārākie Sporta Veidi</h2>
                    <p className="text-xl text-gray-600 text-center mb-16">Izvēlies savu iecienītāko un sāc meklēt</p>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                        {[
                            { name: "Futbols", image: "https://media.istockphoto.com/id/636267430/photo/teenage-friends-playing-football.jpg?s=612x612&w=0&k=20&c=_tgHfR2aD-Q2OXG0zchCunHNEvZDPT9UdxMkhNiWHTM=" },
                            { name: "Basketbols", image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=300&h=200&fit=crop" },
                            { name: "Teniss", image: "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=300&h=200&fit=crop" },
                            { name: "Volejbols", image: "https://res.cloudinary.com/simpleview/image/upload/v1481922813/clients/surfcityusa-redesign/Volleyball_1_0df826c7-1cc7-4334-be80-078425e9069c.jpg" },
                            { name: "Skrējiens", image: "https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=300&h=200&fit=crop" },
                            { name: "Peldēšana", image: "https://images.unsplash.com/photo-1530549387789-4c1017266635?w=300&h=200&fit=crop" }
                        ].map((sport, index) => (
                            <div
                                key={index}
                                className="group cursor-pointer"
                                onClick={redirectToRegister}
                            >
                                <div className="relative h-36 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                                    <img
                                        src={sport.image}
                                        alt={sport.name}
                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/20"></div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-white font-bold text-lg">{sport.name}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-br from-gray-900 to-black relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <img
                        src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1400&h=600&fit=crop"
                        alt="Sporta komanda"
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="relative z-10 max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
                    <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
                        Gatavs Sākt?
                    </h2>
                    <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed">
                        Pievienojies tūkstošiem sporta entuziasti un atrod savus ideālos partnerus.
                    </p>
                    <button
                        onClick={redirectToRegister}
                        className="px-10 py-4 bg-white text-gray-900 hover:bg-gray-100 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 inline-flex items-center space-x-2"
                    >
                        <Users className="w-6 h-6" />
                        <span>Reģistrēties Bezmaksas</span>
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-200 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
                        <div className="col-span-1 sm:col-span-2">
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="w-10 h-10 bg-gradient-to-br from-gray-800 to-black rounded-xl flex items-center justify-center">
                                    <Trophy className="w-6 h-6 text-white" />
                                </div>
                                <span className="text-2xl font-bold text-gray-900">SportMatch</span>
                            </div>
                            <p className="text-gray-600 mb-4 max-w-md leading-relaxed">
                                Apvieno sporta entuziastus visā Latvijā. Atrodi partnerus, pievienojies grupām un izbaudi sportu kopā.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900 mb-4">Platforma</h4>
                            <ul className="space-y-2 text-gray-600">
                                <li>
                                    <button
                                        onClick={() => openModal('ka-darbojas')}
                                        className="hover:text-gray-900 transition-colors text-left"
                                    >
                                        Kā Darbojas
                                    </button>
                                </li>
                                <li>
                                    <button
                                        onClick={() => openModal('sporta-veidi')}
                                        className="hover:text-gray-900 transition-colors text-left"
                                    >
                                        Sporta Veidi
                                    </button>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900 mb-4">Uzņēmums</h4>
                            <ul className="space-y-2 text-gray-600">
                                <li>
                                    <button
                                        onClick={() => openModal('par-mums')}
                                        className="hover:text-gray-900 transition-colors text-left"
                                    >
                                        Par Mums
                                    </button>
                                </li>
                                <li>
                                    <button
                                        onClick={() => openModal('kontakti')}
                                        className="hover:text-gray-900 transition-colors text-left"
                                    >
                                        Kontakti
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-gray-200 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <p className="text-gray-600 text-sm">
                            © 2025 SportMatch. Visas tiesības aizsargātas.
                        </p>
                        <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
                            <button
                                onClick={() => openModal('privatuma-politika')}
                                className="hover:text-gray-900 transition-colors"
                            >
                                Privātuma Politika
                            </button>
                            <button
                                onClick={() => openModal('noteikumi')}
                                className="hover:text-gray-900 transition-colors"
                            >
                                Noteikumi
                            </button>
                        </div>
                    </div>
                </div>
            </footer>

            <FooterModal
                isOpen={modalState.isOpen}
                onClose={closeModal}
                title={modalState.title}
                content={modalState.content}
            />
        </div>
    );
}
