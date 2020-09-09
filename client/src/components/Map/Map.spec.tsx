import React from 'react';
import { screen, act, fireEvent } from '@testing-library/react';
import { setupMocks, wrappedRender } from '@test/utils';
import Map from '@components/Map/Map';

// Setup all the generic mocks
setupMocks();

// MockcreateIrmaSession
jest.mock('@services/createIrmaSession');

describe('Map', () => {
    // it('should render default map with input and no autosuggest visible', async () => {
    //     await act(async () => await wrappedRender(<Map updateLocationCallback={jest.fn()} />));

    //     expect(screen.queryByTestId('map')).toBeInTheDocument();
    //     expect(screen.queryByTestId('input')).toBeInTheDocument();
    //     expect(screen.queryByTestId('autosuggest')).not.toBeInTheDocument();
    // });

    // it('should show autosuggest when input field has changed', async () => {
    //     const spy = jest.fn();
    //     await act(async () => await wrappedRender(<Map updateLocationCallback={jest.fn} />));

    //     act(() => {
    //         fireEvent.change(screen.queryByTestId('input'), { target: { value: 'Dam 1' } });
    //     });

    //     act(() => {
    //         expect(screen.getByTestId('autosuggest')).toBeInTheDocument();
    //     });
    // });

    it('should show correct address when clicked on th map', async () => {
        const spy = jest.fn();

        await act(async () => await wrappedRender(<Map updateLocationCallback={jest.fn} />));

        await act(async () => await fireEvent.click(screen.queryByTestId('map')));

        act(() => {
            // Jonge Roelensteeg 4M, 1012PL Amsterdam
            console.log('location found', screen.queryAllByText('Jonge Roelensteeg 4M, 1012PL Amsterdam').length);

            expect(screen.queryAllByText('Jonge Roelensteeg 4M, 1012PL Amsterdam').length).toBe(1);

            // expect(spy).toHaveBeenCalledTimes(1);
        });
    });
});
