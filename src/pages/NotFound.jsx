import { Link } from 'react-router-dom';
import Header from '~/components/Header';
import * as S from '~/pages/NotFound.styled';

function NotFound() {
  return (
    <S.Container>
      <Header />
      <S.Content>
        <S.Code>404</S.Code>
        <S.Message>Page not found</S.Message>
        <S.HomeLink as={Link} to="/">
          Back to Home
        </S.HomeLink>
      </S.Content>
    </S.Container>
  );
}

export default NotFound;
