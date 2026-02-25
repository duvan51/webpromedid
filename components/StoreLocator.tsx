
import React, { useEffect, useRef } from 'react';
import { Location } from '../types';

interface StoreLocatorProps {
    locations: Location[];
    apiKey: string;
}

declare global {
    namespace JSX {
        interface IntrinsicElements {
            'gmpx-api-loader': any;
            'gmpx-store-locator': any;
        }
    }
}

const StoreLocator: React.FC<StoreLocatorProps> = ({ locations, apiKey }) => {
    const locatorRef = useRef<any>(null);

    useEffect(() => {
        const configureLocator = async () => {
            if (locatorRef.current) {
                // Prepare the configuration from dynamic locations
                const CONFIGURATION = {
                    locations: locations.map(loc => ({
                        title: loc.name,
                        address1: loc.address,
                        address2: loc.city,
                        coords: {
                            lat: loc.latitude || 4.665976,
                            lng: loc.longitude || -74.058817
                        },
                        placeId: loc.place_id
                    })),
                    mapOptions: {
                        center: { lat: 4.570868, lng: -74.297333 }, // Center of Colombia
                        fullscreenControl: true,
                        mapTypeControl: false,
                        streetViewControl: false,
                        zoom: 5,
                        zoomControl: true,
                        maxZoom: 17,
                        mapId: "DEMO_MAP_ID"
                    },
                    mapsApiKey: apiKey,
                    capabilities: {
                        input: true,
                        autocomplete: true,
                        directions: true,
                        distanceMatrix: true,
                        details: true,
                        actions: false
                    }
                };

                // Wait for the custom element to be defined
                if (customElements.get('gmpx-store-locator')) {
                    locatorRef.current.configureFromQuickBuilder(CONFIGURATION);
                } else {
                    customElements.whenDefined('gmpx-store-locator').then(() => {
                        locatorRef.current.configureFromQuickBuilder(CONFIGURATION);
                    });
                }
            }
        };

        configureLocator();
    }, [locations, apiKey]);

    return (
        <div className="w-full h-full min-h-[600px] rounded-[3rem] overflow-hidden bg-slate-50 border border-slate-100 shadow-inner relative">
            <gmpx-api-loader key={apiKey} solution-channel="GMP_QB_locatorplus_v11_cABCDE"></gmpx-api-loader>
            <gmpx-store-locator
                ref={locatorRef}
                style={{
                    '--gmpx-color-surface': '#fff',
                    '--gmpx-color-on-surface': '#0f172a',
                    '--gmpx-color-on-surface-variant': '#64748b',
                    '--gmpx-color-primary': '#059669', // Emerald-600
                    '--gmpx-color-outline': '#f1f5f9',
                    '--gmpx-font-family-base': 'inherit',
                    '--gmpx-font-family-headings': 'inherit',
                    '--gmpx-hours-color-open': '#10b981',
                    '--gmpx-hours-color-closed': '#ef4444',
                    '--gmpx-rating-color': '#f59e0b',
                } as any}
            ></gmpx-store-locator>

            {/* Script loading */}
            <script type="module" src="https://ajax.googleapis.com/ajax/libs/@googlemaps/extended-component-library/0.6.11/index.min.js"></script>
        </div>
    );
};

export default StoreLocator;
