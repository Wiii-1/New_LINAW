{
  description = "pnpm + TypeScript development shell";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  };

  outputs = { self, nixpkgs }:
    let
      system = "x86_64-linux";
      pkgs = import nixpkgs { inherit system; };
    in {
      devShells.${system}.default = pkgs.mkShell {
        packages = with pkgs; [
          nodejs_22
          pnpm
          typescript
          typescript-language-server
          eslint
          prettier
          git
        ];

        shellHook = ''
          export PRISMA_CLI_BINARY_TARGETS="debian-openssl-3.0.x"
          
          echo "pnpm + TypeScript shell ready"
          echo "Prisam target: $PRISMA_CLI_BINARY_TARGETS"
          node --version
          pnpm --version
          tsc --version
        '';
      };
    };
}