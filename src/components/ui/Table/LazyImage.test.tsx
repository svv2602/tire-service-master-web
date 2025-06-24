import React from 'react';
import { render, screen } from '@testing-library/react';
import { LazyImage } from './LazyImage';

describe('LazyImage', () => {
  it('renders fallback if no src', () => {
    render(<LazyImage src={undefined} alt="test" fallback={<span>fallback</span>} />);
    expect(screen.getByText('fallback')).toBeInTheDocument();
  });

  it('renders image if src provided', () => {
    render(<LazyImage src="test.jpg" alt="test" fallback={<span>fallback</span>} />);
    expect(screen.getByAltText('test')).toBeInTheDocument();
  });
});
