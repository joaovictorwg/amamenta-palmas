import styled from "styled-components"

export const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  border-bottom: 1px solid #ddd;
`

export const Logo = styled.h2`
  margin: 0;
`

export const Nav = styled.nav`
  display: flex;
  gap: 12px;

  > a{
    text-decoration: none;
  }
`

export const NavItem = styled.span<{ $active?: boolean }>`
  color: ${({ $active }) => ($active ? "#4f46e5" : "black")};
  font-weight: ${({ $active }) => ($active ? "bold" : "normal")};

  cursor: pointer;

  &:hover {
    opacity: 0.7;
  }
`

export const LangSwitch = styled.div`
  display: flex;
  gap: 8px;

  button {
    padding: 4px 10px;
    cursor: pointer;
  }
`