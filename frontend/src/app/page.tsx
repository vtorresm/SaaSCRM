import Link from 'next/link';

export default function HomePage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
            <div className="flex flex-col items-center justify-center min-h-screen px-4">
                <div className="text-center max-w-2xl">
                    <h1 className="text-5xl font-bold text-primary-900 mb-4">
                        Sales CRM
                    </h1>
                    <p className="text-xl text-primary-700 mb-8">
                        Sistema de Gestion de Ventas de Software
                    </p>
                    <div className="flex gap-4 justify-center">
                        <Link
                            href="/login"
                            className="px-8 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
                        >
                            Iniciar Sesion
                        </Link>
                        <Link
                            href="/register"
                            className="px-8 py-3 border-2 border-primary-600 text-primary-600 rounded-lg font-medium hover:bg-primary-50 transition-colors"
                        >
                            Registrarse
                        </Link>
                    </div>
                    <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                        <div className="bg-white p-6 rounded-xl shadow-sm">
                            <h3 className="font-semibold text-primary-900 mb-2">CRM Completo</h3>
                            <p className="text-sm text-gray-600">
                                Gestion de empresas, contactos y pipeline de ventas en un solo lugar.
                            </p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm">
                            <h3 className="font-semibold text-primary-900 mb-2">Cotizaciones</h3>
                            <p className="text-sm text-gray-600">
                                Crea y envia cotizaciones profesionales con seguimiento automatico.
                            </p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm">
                            <h3 className="font-semibold text-primary-900 mb-2">Facturacion</h3>
                            <p className="text-sm text-gray-600">
                                Sistema de facturacion integrado con seguimiento de pagos.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
