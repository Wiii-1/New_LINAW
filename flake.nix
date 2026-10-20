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
          prisma-engines
          typescript
          typescript-language-server
          eslint
          prettier
          git
        ];

        shellHook = ''
          export PRISMA_SCHEMA_ENGINE_BINARY="${pkgs.prisma-engines}/bin/schema-engine"
          export PRISMA_CLI_BINARY_TARGETS="debian-openssl-3.0.x"

          echo "pnpm + TypeScript shell ready"
          echo "Prisma schema engine: $PRISMA_SCHEMA_ENGINE_BINARY"
          node --version
          pnpm --version
          tsc --version
        '';
      };
    };
}